# models.py
from django.db import models

class Lobby(models.Model):
    code = models.CharField(max_length=6, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_cards = models.JSONField(default=list)
    removed_cards = models.JSONField(default=list)

class Player(models.Model):
    name = models.CharField(max_length=100)
    lobby = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="players")
    house_card = models.CharField(max_length=255, null=True)  # Field to store the house card
    ninja_cards = models.JSONField(default=list)  # Field to store ninja cards as a list (using JSONField)
    passed_cards = models.JSONField(default=list)
    recieved_cards = models.JSONField(default=list)
    passed = models.BooleanField(default = False, null = False, blank = False)
    removed = models.BooleanField(default = False, null = False, blank = False)

    def __str__(self):
        return self.name
