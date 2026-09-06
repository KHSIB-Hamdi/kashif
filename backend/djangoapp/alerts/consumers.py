import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
logger = logging.getLogger(__name__)


class AlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "alerts",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "alerts",
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'alert_update':
            await self.alert_update(data)
        else:
            logger.warning(f"Received unknown message type: {message_type}")

    async def alert_update(self, event):
        logger.info(f"Received alert update: {event['data']}")
        await self.send(text_data=json.dumps(event['data']))