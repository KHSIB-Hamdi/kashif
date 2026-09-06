from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/ratings/', consumers.RatingConsumer.as_asgi()),
]