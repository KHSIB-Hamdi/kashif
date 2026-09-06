import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class TransactionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "transactions",
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "transactions",
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'transaction_update':
            await self.transaction_update(data)
        else:
            logger.warning(f"Received unknown message type: {message_type}")

    async def transaction_update(self, event):
        logger.info(f"Received transaction update: {event['data']}")
        await self.send(text_data=json.dumps(event['data']))

    # Optional: define methods for handling different events
