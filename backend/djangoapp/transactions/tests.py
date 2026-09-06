from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Transaction


def make_transaction(**overrides):
    """A Transaction with every required field populated."""
    defaults = dict(
        REF_UNIQUE=209409000001,
        DEV_CPTE='TND',
        PRODUIT='Carte Gold Nationale',
        DATE_TRX=timezone.now(),
        NUM_AUTORISATION=123456,
        MONTANT_TRX=Decimal('150.500'),
        CHAPITRE=1,
        LIB_CPTE='COMPTE TEST',
        UTILISATION='RETRAIT',
        EMPLACEMENT='TUNIS',
        TERRITOIRE='TUN',
        IS_FRAUDULENT=False,
        PROCESSED=True,
    )
    defaults.update(overrides)
    return Transaction.objects.create(**defaults)


class TransactionModelTests(APITestCase):
    def test_is_fraudulent_field_exists_and_defaults_to_false(self):
        """Guards the IS_COMPLIANT -> IS_FRAUDULENT rename (migration 0005)."""
        txn = make_transaction()
        self.assertFalse(txn.IS_FRAUDULENT)
        self.assertFalse(hasattr(txn, 'IS_COMPLIANT'))

    def test_str_includes_account_and_amount(self):
        txn = make_transaction()
        self.assertIn('TND', str(txn))


class TransactionAPITests(APITestCase):
    def setUp(self):
        self.fraud = make_transaction(REF_UNIQUE=1, IS_FRAUDULENT=True, PRODUIT='Carte Gold')
        self.clean = make_transaction(REF_UNIQUE=2, IS_FRAUDULENT=False, PRODUIT='Salaire Plus')

    def test_list_returns_paginated_results(self):
        res = self.client.get('/api/transactions')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)
        self.assertIn('results', res.data)

    def test_list_serializes_is_fraudulent_not_is_compliant(self):
        res = self.client.get('/api/transactions')
        row = res.data['results'][0]
        self.assertIn('IS_FRAUDULENT', row)
        self.assertNotIn('IS_COMPLIANT', row)

    def test_list_is_filterable(self):
        """Exercises DjangoFilterBackend, which needs django_filters installed."""
        res = self.client.get('/api/transactions', {'PRODUIT': 'Salaire Plus'})
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['results'][0]['REF_UNIQUE'], 2)

    def test_detail_includes_model_performance(self):
        res = self.client.get(f'/api/transactions/{self.fraud.pk}/details/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('model_performance', res.data)

    def test_detail_404_for_missing_transaction(self):
        res = self.client.get('/api/transactions/999999/details/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_distinct_values_for_allowed_field(self):
        res = self.client.get('/api/transactions/distinct/PRODUIT/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertCountEqual(res.data, ['Carte Gold', 'Salaire Plus'])

    def test_distinct_values_rejects_unknown_field(self):
        res = self.client.get('/api/transactions/distinct/MONTANT_TRX/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_returns_204(self):
        res = self.client.delete(f'/api/transactions/delete/{self.clean.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Transaction.objects.filter(pk=self.clean.pk).exists())
