"""
Custom JWT authentication using plain PyJWT.
No django-simplejwt dependency needed.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
import datetime
from django.conf import settings


class MongoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return None
        token = header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Invalid token payload')

        from .models import User
        try:
            user = User.objects.get(id=user_id)
            return (user, token)
        except Exception:
            raise AuthenticationFailed('User not found')


def get_tokens_for_user(user):
    now = datetime.datetime.utcnow()
    access = jwt.encode(
        {'user_id': str(user.id), 'exp': now + datetime.timedelta(days=7), 'iat': now},
        settings.SECRET_KEY, algorithm='HS256'
    )
    refresh = jwt.encode(
        {'user_id': str(user.id), 'exp': now + datetime.timedelta(days=30), 'iat': now},
        settings.SECRET_KEY, algorithm='HS256'
    )
    return {'access': access, 'refresh': refresh}