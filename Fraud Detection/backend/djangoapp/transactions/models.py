from django.db import models

# Create your models here.
class Transaction(models.Model):
    REF_UNIQUE = models.BigIntegerField()
    DEV_CPTE = models.CharField(max_length=255)
    PRODUIT = models.CharField(max_length=255)
    DATE_TRX = models.DateTimeField()
    NUM_AUTORISATION = models.BigIntegerField()
    MONTANT_TRX = models.DecimalField(max_digits=9, decimal_places=3)
    CHAPITRE = models.BigIntegerField()
    LIB_CPTE = models.CharField(max_length=255)
    UTILISATION = models.CharField(max_length=255)
    EMPLACEMENT = models.CharField(max_length=255)
    TERRITOIRE = models.CharField(max_length=255)
    # True  => the model classified this transaction as FRAUDULENT.
    # Renamed from IS_COMPLIANT, whose name asserted the opposite of its value.
    IS_FRAUDULENT = models.BooleanField(default=False)
    PROCESSED = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.DEV_CPTE} - {self.MONTANT_TRX}'


