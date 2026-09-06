from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/transactions/', consumers.TransactionConsumer.as_asgi()),
]