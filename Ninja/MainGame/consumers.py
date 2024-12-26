# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        await self.channel_layer.group_add(self.game_id, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_id, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Broadcast received data
        await self.channel_layer.group_send(self.game_id, {"type": "game_update", "message": data})

    async def game_update(self, event):
        await self.send(text_data=json.dumps(event["message"]))
