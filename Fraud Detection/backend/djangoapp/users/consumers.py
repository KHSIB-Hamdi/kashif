# consumers.py in the users app
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class UserActivityConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("user-activity", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("user-activity", self.channel_name)

    async def user_activity_update(self, event):
        # Send the user activity update to the WebSocket
        await self.send(text_data=json.dumps(event["data"]))
