from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import UserActivity


class AuthEndpointTests(APITestCase):
    """
    Guards the django-rest-auth -> dj-rest-auth migration: the /api/auth/
    URLs and the token-based flow must behave exactly as before.
    """

    def setUp(self):
        self.password = 'sup3r-s3cret-pw'
        self.user = User.objects.create_user(
            username='operator', email='operator@example.com', password=self.password
        )

    def test_login_returns_a_token(self):
        res = self.client.post('/api/auth/login/',
                               {'username': 'operator', 'password': self.password})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('key', res.data)
        self.assertTrue(Token.objects.filter(user=self.user).exists())

    def test_login_rejects_bad_credentials(self):
        res = self.client.post('/api/auth/login/',
                               {'username': 'operator', 'password': 'wrong'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_records_user_activity(self):
        """users/signals.py listens for Django's user_logged_in signal."""
        self.client.post('/api/auth/login/',
                         {'username': 'operator', 'password': self.password})
        self.assertTrue(
            UserActivity.objects.filter(user=self.user, action='login').exists(),
            'login should be written to the UserActivity audit log',
        )

    def test_logout_requires_authentication(self):
        res = self.client.post('/api/auth/logout/')
        self.assertIn(res.status_code,
                      (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_user_detail_requires_authentication(self):
        res = self.client.get('/api/auth/users/detail/')
        self.assertIn(res.status_code,
                      (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_user_detail_returns_current_user(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        res = self.client.get('/api/auth/users/detail/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'operator')

    def test_delete_user_returns_204(self):
        victim = User.objects.create_user(username='temp', password='x')
        res = self.client.delete(f'/api/auth/users/delete/{victim.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=victim.pk).exists())
