"""
ASGI config for mainapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from transactions import routing as transactions_routing
from alerts import routing as alerts_routing
from users import routing as users_routing
from prediction import routing as ratings_routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mainapp.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": 
        AuthMiddlewareStack(
        URLRouter(
            transactions_routing.websocket_urlpatterns + alerts_routing.websocket_urlpatterns + users_routing.websocket_urlpatterns + ratings_routing.websocket_urlpatterns
        )
        
    ),
})
