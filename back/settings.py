"""
Django settings for social media app.
Uses mongoengine (PyMongo) for MongoDB — no djongo needed.
"""
from pathlib import Path
import mongoengine

BASE_DIR = Path(__file__).resolve().parent

SECRET_KEY = 'django-insecure-social-app-secret-key-change-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',          # required by DRF for AnonymousUser
    'django.contrib.contenttypes',  # required by django.contrib.auth
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'urls'

# SQLite only for Django internals (auth tables etc.) — all app data is in MongoDB
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Connect to MongoDB via mongoengine
MONGO_URI = 'mongodb://localhost:27017/socialapp'
mongoengine.connect(host=MONGO_URI)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.auth.MongoJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Use DRF's built-in AnonymousUser (doesn't need a DB)
    'UNAUTHENTICATED_USER': None,
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'