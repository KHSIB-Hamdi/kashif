import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

#################################################################
    ##  Get Django environment set by docker (i.e either development or production), or else set it to local ##
#################################################################
try:
    DJANGO_ENV = os.environ.get("DJANGO_ENV")
except:
    DJANGO_ENV = 'local'

if DJANGO_ENV == 'development' or DJANGO_ENV == 'production':

    try:
        SECRET_KEY = os.environ.get("SECRET_KEY")
    except:
        SECRET_KEY = 'localsecret'

    try:
        DEBUG = int(os.environ.get("DEBUG", default=0))
    except:
        DEBUG = False

    try:
        ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS").split(" ")
    except:
        ALLOWED_HOSTS = ['127.0.0.1', '0.0.0.0', 'localhost']

    DATABASES = {
        "default": {
            "ENGINE": os.environ.get("DB_ENGINE", "django.db.backends.sqlite3"),
            "NAME": os.environ.get("DB_DATABASE", os.path.join(BASE_DIR, "db.sqlite3")),
            "USER": os.environ.get("DB_USER", "user"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "password"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }

else:

    SECRET_KEY = 'localsecret'
    DEBUG = True
    ALLOWED_HOSTS = ['127.0.0.1', '0.0.0.0', 'localhost']

    # Local development defaults. Credentials come from the environment so that
    # nothing secret lives in tracked source; see backend/.env.example.
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': os.environ.get('DB_DATABASE', 'predictiondb'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }



#################################################################
    ##  (CORS) Cross-Origin Resource Sharing Settings ##
#################################################################
# Wide-open CORS is fine for local development but must not ship. In
# development/production the allowed origins come from CORS_ALLOWED_ORIGINS
# (comma-separated); if unset we fall back to allow-all and warn in the logs.
if DJANGO_ENV in ('development', 'production'):
    _origins = os.environ.get('CORS_ALLOWED_ORIGINS', '').strip()
    if _origins:
        CORS_ALLOWED_ORIGINS = [o.strip() for o in _origins.split(',') if o.strip()]
        CORS_ORIGIN_ALLOW_ALL = False
    else:
        CORS_ORIGIN_ALLOW_ALL = True
else:
    CORS_ORIGIN_ALLOW_ALL = True
#################################################################
    ##  STATIC FILES ROOT AND URL ##
#################################################################
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'