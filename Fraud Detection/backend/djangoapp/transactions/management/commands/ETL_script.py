import os
import joblib
import time
import pandas as pd
from django.core.management.base import BaseCommand
from transactions.models import Transaction
from alerts.models import Alert
from datetime import datetime
from django.db import transaction as db_transaction
from sklearn.preprocessing import LabelEncoder, normalize
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging
logger = logging.getLogger(__name__)
from django.core.mail import send_mail
from django.conf import settings
from prediction.models import ModelPerformance
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import re
import decimal

def broadcast_transaction_update(transaction):
    logger.info(f"Attempting to broadcast transaction update: {transaction.id}")
    channel_layer = get_channel_layer()
    if not channel_layer:
        logger.error("Channel layer is not available.")
        return
    try:
        async_to_sync(channel_layer.group_send)(
            "transactions",
            {
                "type": "transaction_update",
                "data": {
                    "id": transaction.id,
                    "IS_FRAUDULENT": transaction.IS_FRAUDULENT,
                    "DATE_TRX": transaction.DATE_TRX.isoformat() if transaction.DATE_TRX else None,
                    "MONTANT_TRX": float(transaction.MONTANT_TRX) if transaction.MONTANT_TRX is not None else None,
                    "PRODUIT": transaction.PRODUIT,
                }
            }
        )
        logger.info(f"Successfully broadcasted transaction update: {transaction.id}")
    except Exception as e:
        logger.error(f"Error broadcasting transaction update: {e}")

def broadcast_alert_update(alert):
    logger.info(f"Broadcasting alert update: {alert.id}")
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "alerts",
        {
            "type": "alert_update",
            "data": {
                "id": alert.id,
                "message": alert.message,
                "timestamp": alert.timestamp.isoformat(),
                "severity": alert.severity,
                "transaction": alert.transaction_id
            }
        }
    )

def save_model_performance(transaction, actual, prediction):
    
    accuracy = accuracy_score([actual], [prediction])
    
    
    if sum([actual]) == 0 or sum([prediction]) == 0:
        precision = 0.0
        recall = 0.0
        f1 = 0.0
    else:
        precision = precision_score([actual], [prediction])
        recall = recall_score([actual], [prediction])
        f1 = f1_score([actual], [prediction])

    model_performance = ModelPerformance(
        model_name="Random Forest",
        accuracy=accuracy,
        precision=precision,
        recall=recall,
        f1_score=f1,
        timestamp=timezone.now(),
        transaction=transaction
    )
    model_performance.save()

class Command(BaseCommand):
    help = 'Import and classify transactions from CSV file into the database'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the CSV or Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f'Processing file: {file_path}...')

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        file_extension = os.path.splitext(file_path)[1].lower()
        if file_extension not in ['.csv', '.xlsx']:
            self.stderr.write(self.style.ERROR(f'Unsupported file type: {file_extension}'))
            return
        
        if file_extension == '.xlsx':
            csv_file_path = file_path.replace('.xlsx', '.csv')
            if not os.path.exists(csv_file_path) or os.path.getmtime(file_path) > os.path.getmtime(csv_file_path):
                self.stdout.write(f'Converting Excel file to CSV: {csv_file_path}...')
                try:
                    excel_data = pd.read_excel(file_path)
                    excel_data.to_csv(csv_file_path, index=False)
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f'Error converting file: {e}'))
                    return
            file_path = csv_file_path

        def parse_date(date_str):
            try:
                
                naive_date = datetime.strptime(date_str, '%m/%d/%Y %H:%M')
                return timezone.make_aware(naive_date, timezone.get_current_timezone())
            except ValueError as e:
                logger.error(f"Error parsing date '{date_str}': {e}")
                return None
            
        def parse_decimal(value):
            try:                
                cleaned_value = re.sub(r'[^\d.,-]', '', str(value))
                if ',' in cleaned_value and '.' not in cleaned_value:
                    cleaned_value = cleaned_value.replace(',', '.')

                return decimal.Decimal(cleaned_value)
            except (decimal.InvalidOperation, ValueError) as e:
                logger.error(f"Error parsing decimal value: {value}. Exception: {e}")
                return None
        
        try:
            for chunk in pd.read_csv(file_path, chunksize=1):  
                if chunk.empty:
                    continue  

                row_index = chunk.index[0]
                
                parsed_date = parse_date(chunk.at[row_index, 'DATE_TRX'])
                parsed_decimal = parse_decimal(chunk.at[row_index, 'MONTANT_TRX'])
               
                
                if pd.isna(parsed_date) or pd.isna(parsed_decimal):
                    self.stderr.write(self.style.ERROR(f"Failed to parse values in row: {chunk.loc[[row_index]]}"))
                    continue 

                chunk.at[row_index, 'DATE_TRX'] = parsed_date
                chunk.at[row_index, 'MONTANT_TRX'] = parsed_decimal

                
                if pd.isna(chunk.at[row_index, 'DATE_TRX']):
                    self.stderr.write(self.style.ERROR(f'Null value detected in DATE_TRX: {chunk.loc[[row_index]]}'))
                    continue

                rf_model = joblib.load(settings.FRAUD_MODEL_PATH)

                
                transaction_data = chunk.loc[[row_index]]
                
                
                categorical_columns = [
                    'DEV_CPTE', 'PRODUIT', 'LIB_CPTE', 'UTILISATION', 'EMPLACEMENT', 'TERRITOIRE'
                ]
                numerical_columns = [
                    'REF_UNIQUE', 'NUM_AUTORISATION', 'MONTANT_TRX', 'CHAPITRE'
                ]

                le = LabelEncoder()
                for col in categorical_columns:
                    transaction_data[col + '_encoded'] = le.fit_transform(transaction_data[col].astype(str))

                encoded_columns = [col + '_encoded' for col in categorical_columns]
                transaction_data_encoded = transaction_data[encoded_columns]
                transaction_data_numerical = transaction_data[numerical_columns]
                transaction_data = pd.concat([transaction_data_encoded, transaction_data_numerical], axis=1)
                
                column_order = [
                    'REF_UNIQUE', 'NUM_AUTORISATION', 'MONTANT_TRX', 'CHAPITRE',
                    'DEV_CPTE_encoded', 'PRODUIT_encoded', 'LIB_CPTE_encoded',
                    'UTILISATION_encoded', 'EMPLACEMENT_encoded', 'TERRITOIRE_encoded'
                ]
                transaction_data = transaction_data[column_order]
                transaction_data = normalize(transaction_data)
                transaction_data_df = pd.DataFrame(transaction_data, columns=column_order)

                prediction = rf_model.predict(transaction_data_df)[0]
                result = 'normal' if prediction > 0.5 else 'fraud'

                
                with db_transaction.atomic():
                    txn = Transaction(
                        DATE_TRX=chunk.at[row_index, 'DATE_TRX'],
                        PRODUIT=chunk.at[row_index, 'PRODUIT'],
                        REF_UNIQUE=chunk.at[row_index, 'REF_UNIQUE'],
                        DEV_CPTE=chunk.at[row_index, 'DEV_CPTE'],
                        NUM_AUTORISATION=chunk.at[row_index, 'NUM_AUTORISATION'],
                        MONTANT_TRX=chunk.at[row_index, 'MONTANT_TRX'],
                        CHAPITRE=chunk.at[row_index, 'CHAPITRE'],
                        LIB_CPTE=chunk.at[row_index, 'LIB_CPTE'],
                        UTILISATION=chunk.at[row_index, 'UTILISATION'],
                        EMPLACEMENT=chunk.at[row_index, 'EMPLACEMENT'],
                        TERRITOIRE=chunk.at[row_index, 'TERRITOIRE'],
                        IS_FRAUDULENT=result == 'fraud',
                        PROCESSED=True 
                    )
                    txn.save()

                    save_model_performance(txn, txn.IS_FRAUDULENT, result == 'fraud')
                    broadcast_transaction_update(txn)
                    
                    if txn.IS_FRAUDULENT:
                        alert = Alert.objects.create(transaction_id=txn.id, message='Transaction non conforme détectée', severity='high')
                        broadcast_alert_update(alert)
                        try:
                            subject = 'Transaction non conforme détectée'
                            message = (f'Une transaction non conforme a été détectée:\n\n'
                                    f'Transaction ID: {txn.id}\n'
                                    f'Date: {txn.DATE_TRX}\n'
                                    f'Montant: {txn.MONTANT_TRX}\n'
                                    f'Devise: {txn.DEV_CPTE}')
                            recipient_list = [settings.EMAIL_HOST_USER]
                            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list)
                            logger.info(f'Email sent to admin for transaction {txn.id}')
                        except Exception as e:
                            logger.error(f'Error sending email: {e}')

                self.stdout.write(self.style.SUCCESS(f'Processed and saved transaction {txn.id}.'))
                time.sleep(0.5) 
                
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error processing file: {e}'))