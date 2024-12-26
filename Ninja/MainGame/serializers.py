# # serializers.py
# from rest_framework import serializers
# from .models import Player, Card

# class CardSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Card
#         fields = ["card_type", "value"]

# class PlayerSerializer(serializers.ModelSerializer):
#     cards = CardSerializer(many=True, source="card_set")  # Related name for cards

#     class Meta:
#         model = Player
#         fields = ["house_card", "cards", "is_alive", "honor_points"]

from rest_framework import serializers
from .models import Game, Player, Card

class PlayerSerializer(serializers.ModelSerializer):
    cards = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ['id', 'user', 'house_card', 'cards']

    def get_cards(self, player):
        return CardSerializer(player.card_set.all(), many=True).data


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'card_type', 'value']


class GameSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'name', 'is_active', 'players']
