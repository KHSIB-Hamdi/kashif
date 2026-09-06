"""
Settings for the test suite.

Uses an in-memory SQLite database and an in-memory channel layer so tests need
neither PostgreSQL nor Redis:

    python manage.py test --settings=mainapp.test_settings
"""

from .settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Avoid requiring a running Redis instance during tests.
CHANNEL_LAYERS = {
    'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'},
}

EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
