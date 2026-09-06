import json
from channels.generic.websocket import AsyncWebsocketConsumer


class RatingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            "ratings",
            self.channel_name
        )
        await self.accept()
        

    async def send_rating(self, event):
        # Retrieve the data from the event
        rating = event["rating"]
        user = event["user"]
        
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            "rating": rating,
            "user": user
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            "ratings",
            self.channel_name
        )
    
