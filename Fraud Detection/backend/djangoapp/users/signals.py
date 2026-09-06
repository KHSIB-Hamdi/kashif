# signals.py in the users app
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from .models import UserActivity
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from django.utils import timezone

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    UserActivity.objects.create(user=user, action='login')
    broadcast_user_activity(user, 'login')

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    UserActivity.objects.create(user=user, action='logout')
    broadcast_user_activity(user, 'logout')

def broadcast_user_activity(user, action):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "user-activity",
        {
            "type": "user_activity_update",
            "data": {
                "username": user.username,
                "action": action,
                "timestamp": str(timezone.now())
            }
        }
    )
