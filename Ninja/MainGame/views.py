# views.py
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Lobby, Player
import random
import string
from django.views.decorators.csrf import csrf_exempt
import json


HOUSE_CARDS = [
    "lotus_1", "crane_1", "lotus_2", "crane_2",
    "lotus_3", "crane_3", "lotus_4", "crane_4"
]

NINJA_CARDS = [
    "mystic_1", "mystic_2", "mystic_3", "mystic_4",
    "spy_1", "spy_2", "spy_3", "spy_4",
    "blind_assassin_1", "blind_assassin_2", "blind_assassin_3", "blind_assassin_4",
    "trickster_1", "trickster_2", "trickster_3", "trickster_4",
    "shinobi_1", "shinobi_2", "shinobi_3", "shinobi_4", "react_1", "react_2", "react_3"
]

CARD_IMAGES = {
    "lotus_1": "/static/cards/lotus_1.jpg",
    "lotus_2": "/static/cards/lotus_2.jpg",
    "lotus_3": "/static/cards/lotus_3.jpg",
    "lotus_4": "/static/cards/lotus_4.jpg",
    "crane_1": "/static/cards/crane_1.jpg",
    "crane_2": "/static/cards/crane_2.jpg",
    "crane_3": "/static/cards/crane_3.jpg",
    "crane_4": "/static/cards/crane_4.jpg",
    "mystic_1": "/static/cards/mystic_1.jpg",
    "mystic_2": "/static/cards/mystic_2.jpg",
    "mystic_3": "/static/cards/mystic_3.jpg",
    "mystic_4": "/static/cards/mystic_4.jpg",
    "spy_1": "/static/cards/spy_1.jpg",
    "spy_2": "/static/cards/spy_2.jpg",
    "spy_3": "/static/cards/spy_3.jpg",
    "spy_4": "/static/cards/spy_4.jpg",
    "blind_assassin_1": "/static/cards/blind_assassin_1.jpg",
    "blind_assassin_2": "/static/cards/blind_assassin_2.jpg",
    "blind_assassin_3": "/static/cards/blind_assassin_3.jpg",
    "blind_assassin_4": "/static/cards/blind_assassin_4.jpg",
    "trickster_1": "/static/cards/trickster_1.jpg",
    "trickster_2": "/static/cards/trickster_2.jpg",
    "trickster_3": "/static/cards/trickster_3.jpg",
    "trickster_4": "/static/cards/trickster_4.jpg",
    "shinobi_1": "/static/cards/shinobi_1.jpg",
    "shinobi_2": "/static/cards/shinobi_2.jpg",
    "shinobi_3": "/static/cards/shinobi_3.jpg",
    "shinobi_4": "/static/cards/shinobi_4.jpg",
    "react_1": "/static/cards/react_1.jpg",
    "react_2": "/static/cards/react_2.jpg",
    "react_3": "/static/cards/react_3.jpg",
}

def create_lobby(request):
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    lobby = Lobby.objects.create(code=code)
    return JsonResponse({'lobby_code': lobby.code})

def join_lobby(request, lobby_code):
    lobby = get_object_or_404(Lobby, code=lobby_code)
    
    # Check if the lobby is full (assuming a max of 4 players)
    if lobby.players.count() >= 4:
        return JsonResponse({'error': 'Lobby is full'}, status=400)
    
    player_name = request.GET.get('name')
    
    # Create a new player and assign them a unique player_id within this lobby
    player = Player(name=player_name, lobby=lobby)
    player.save()
    
    # Return the count of players in the lobby
    players_count = lobby.players.count()
    
    return JsonResponse({'players_count': players_count, 'player_id' : player.id})
@csrf_exempt
def reshuffle_deck(request, lobby_code):
    # Fetch the lobby object
    lobby = get_object_or_404(Lobby, code=lobby_code)

    # Reset all players' cards (clear out old cards)
    for player in lobby.players.all():
        player.house_card = None
        player.ninja_cards = []  # Clear ninja cards as well
        player.save()

    # Clear used cards from the lobby
    lobby.used_cards = []  # Reset the used cards list
    lobby.save()

    # Call shuffle_and_deal function to reshuffle and redistribute the cards
    shuffled_response = shuffle_and_deal(request, lobby_code)

    # The response from shuffle_and_deal is already in JSON format, so just pass it as is
    return shuffled_response


def shuffle_and_deal(request, lobby_code):
    lobby = get_object_or_404(Lobby, code=lobby_code)
    players = list(lobby.players.all())  # Ensure we get the full list of players

    playeramount = len(players)

    # Clear the removed cards list when reshuffling
    lobby.removed_cards.clear()
    lobby.save()

    if playeramount % 2 == 0:
        cardstoget = HOUSE_CARDS[:(playeramount)]
        # Ensure enough ninja cards are available
        if len(players) * 3 > len(NINJA_CARDS):
            return JsonResponse({'error': 'Not enough ninja cards for all players'}, status=400)

        # Shuffle the cards
        shuffled_house = random.sample(cardstoget, len(players))  # Shuffle house cards
        shuffled_ninja = random.sample(NINJA_CARDS, len(players) * 3)  # Shuffle enough ninja cards for 3 per player

        player_cards = {}
        available_house_cards = shuffled_house.copy()
        available_ninja_cards = shuffled_ninja.copy()

        for i, player in enumerate(players):
            # Assign cards
            house_card = available_house_cards.pop()
            ninja_cards = [available_ninja_cards.pop(), available_ninja_cards.pop(), available_ninja_cards.pop()]

            # Save the cards in the player object
            player.house_card = house_card
            player.ninja_cards = ninja_cards
            player.save()

            # Store in the response
            player_cards[player.id] = {
                "house_card": house_card,
                "ninja_cards": ninja_cards,
            }

        return JsonResponse({
            'status': 'Cards redistributed after reshuffle',
            'player_cards': player_cards
        })
    else:
        cardstoget = HOUSE_CARDS
        # Ensure enough ninja cards are available
        if len(players) * 3 > len(NINJA_CARDS):
            return JsonResponse({'error': 'Not enough ninja cards for all players'}, status=400)

        # Shuffle the cards
        shuffled_house = random.sample(cardstoget, len(players))  # Shuffle house cards
        shuffled_ninja = random.sample(NINJA_CARDS, len(players) * 3)  # Shuffle enough ninja cards for 3 per player

        player_cards = {}
        available_house_cards = shuffled_house.copy()
        available_ninja_cards = shuffled_ninja.copy()

        for i, player in enumerate(players):
            # Assign cards
            house_card = available_house_cards.pop()
            ninja_cards = [available_ninja_cards.pop(), available_ninja_cards.pop(), available_ninja_cards.pop()]

            # Save the cards in the player object
            player.house_card = house_card
            player.ninja_cards = ninja_cards
            player.save()

            # Store in the response
            player_cards[player.id] = {
                "house_card": house_card,
                "ninja_cards": ninja_cards,
            }

        return JsonResponse({
            'status': 'Cards redistributed after reshuffle',
            'player_cards': player_cards
        })


def get_players(request, lobby_code):
    # Fetch the lobby
    lobby = get_object_or_404(Lobby, code=lobby_code)

    # Get the players in the lobby
    players = lobby.players.all()  # Assuming players is a related field

    # Create a list of player data to send in the response
    player_list = [{
        'id': player.id,
        'name': player.name,
    } for player in players]

    # Return the list of players in JSON format
    return JsonResponse({'players': player_list})


def get_player_cards(request, lobby_code, player_id):
    try:
        # Fetch the player and their cards
        player = Player.objects.get(id=player_id, lobby__code=lobby_code)
        player_cards = {
            'house_card': player.house_card,
            'ninja_cards': player.ninja_cards
        }
        return JsonResponse(player_cards)
    except Player.DoesNotExist:
        return JsonResponse({'error': 'Player not found'}, status=404)
    
@csrf_exempt
def delete_lobby(request, lobby_code):
    lobby = get_object_or_404(Lobby, code=lobby_code)
    
    lobby.delete()
    
    return JsonResponse({"message": "Lobby deleted successfully"})
@csrf_exempt
def discard_and_redistribute(request, lobby_code, player_id):
    """
    Handles discarding 1 ninja card and redistributing it to the next player in a circular order.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method. Use POST.'}, status=405)

    # Parse request data
    try:
        data = json.loads(request.body)
        discarded_card = data['discarded_card']  # Single card to discard
    except (KeyError, ValueError) as e:
        return JsonResponse({'error': 'Invalid request data. Include discarded_card.'}, status=400)

    # Fetch the lobby and players
    lobby = get_object_or_404(Lobby, code=lobby_code)
    players = list(lobby.players.all())

    # Fetch the discarding player
    discarding_player = next((player for player in players if player.id == player_id), None)
    if not discarding_player:
        return JsonResponse({'error': 'Discarding player not found.'}, status=404)

    # Ensure the player actually owns the discarded card
    if discarded_card not in discarding_player.ninja_cards:
        return JsonResponse({'error': 'Player does not own the discarded card.'}, status=400)

    # Remove discarded card from the player's hand
    ninja_cards = list(discarding_player.ninja_cards)  # Convert to list if necessary
    ninja_cards.remove(discarded_card)  # Remove the discarded card from the player's hand
    discarding_player.ninja_cards = ninja_cards
    discarding_player.save()

    # Find the index of the discarding player
    player_index = next((index for index, player in enumerate(players) if player.id == player_id), None)
    if player_index is None:
        return JsonResponse({'error': 'Player not found in the lobby.'}, status=404)

    # Now, distribute the discarded card to the next player in a circular order
    current_player_index = (player_index + 1) % len(players)  # Get the next player, wrapping around circularly
    receiving_player = players[current_player_index]

    # Add the discarded card to the receiving player's hand
    receiving_player_ninja_cards = list(receiving_player.ninja_cards)  # Ensure we are working with a list
    receiving_player_ninja_cards.append(discarded_card)  # Add the discarded card
    receiving_player.ninja_cards = receiving_player_ninja_cards
    receiving_player.save()

    # Response to indicate successful discard and redistribution
    return JsonResponse({'status': 'Card discarded and redistributed successfully.'})


@csrf_exempt
def remove_card(request, lobby_code, player_id):
    """
    Handles removing a ninja card from the game completely and tracks it in the lobby's removed cards.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method. Use POST.'}, status=405)

    # Parse request data
    try:
        data = json.loads(request.body)
        card_to_remove = data['card_to_remove']  # The card to remove from the game
    except (KeyError, ValueError) as e:
        return JsonResponse({'error': 'Invalid request data. Include card_to_remove.'}, status=400)

    # Fetch the lobby and player
    lobby = get_object_or_404(Lobby, code=lobby_code)
    players = list(lobby.players.all())

    # Fetch the player who is discarding
    removing_player = next((player for player in players if player.id == player_id), None)
    if not removing_player:
        return JsonResponse({'error': 'Player not found.'}, status=404)

    # Ensure the player owns the card they want to remove
    if card_to_remove not in removing_player.ninja_cards:
        return JsonResponse({'error': 'Player does not own the card to remove.'}, status=400)

    # Remove the card from the player's hand and update the player's ninja cards
    removing_player.ninja_cards.remove(card_to_remove)
    removing_player.save()

    # Add the card to the lobby's removed_cards list
    if not lobby.removed_cards:
        lobby.removed_cards = []  # Initialize if the field is empty
    lobby.removed_cards.append(card_to_remove)
    lobby.save()

    return JsonResponse({'status': 'Card removed successfully from the game.'})


@csrf_exempt
def use_card(request, lobby_code, player_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method. Use POST.'}, status=405)

    try:
        data = json.loads(request.body)
        used_card = data['used_card']
    except (KeyError, ValueError):
        return JsonResponse({'error': 'Invalid request data. Include used_card.'}, status=400)

    lobby = get_object_or_404(Lobby, code=lobby_code)
    player = get_object_or_404(Player, id=player_id, lobby=lobby)

    # Log the used card
    if not hasattr(lobby, 'used_cards'):
        lobby.used_cards = []  # Initialize if not present
    lobby.used_cards.append({'player_name': player.name, 'card': used_card})
    lobby.save()

    return JsonResponse({'status': 'Card used successfully.'})


# View for fetching the list of used cards in a lobby
def get_used_cards(request, lobby_code):
    lobby = get_object_or_404(Lobby, code=lobby_code)
    used_cards = getattr(lobby, 'used_cards', [])
    return JsonResponse({'used_cards': used_cards})

def clear_used_cards(request, lobby_code):
    # Check if the user is authorized (you can implement your own authorization logic)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    # Get the game object by lobby_code
    game = get_object_or_404(Lobby, lobby_code=lobby_code)

    # Clear the used cards array
    game.used_cards.clear()

    # Save the game state after clearing used cards
    game.save()

    # Return success response
    return JsonResponse({'status': 'Used cards cleared successfully'})


def get_removed_cards(request, lobby_code):
    lobby = get_object_or_404(Lobby, code=lobby_code)
    removed_cards = lobby.removed_cards  # Retrieve the removed cards
    return JsonResponse({'removed_cards': removed_cards})

# Deal a removed card to a specific player
@csrf_exempt
def deal_removed_card(request, lobby_code):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid HTTP method. Use POST.'}, status=405)

    # Parse request data
    try:
        data = json.loads(request.body)
        player_id = data['player_id']
    except (KeyError, ValueError):
        return JsonResponse({'error': 'Invalid request data. Include player_id.'}, status=400)

    # Fetch the lobby and player
    lobby = get_object_or_404(Lobby, code=lobby_code)
    player = get_object_or_404(Player, id=player_id, lobby=lobby)

    # Ensure there are removed cards available
    if not lobby.removed_cards:
        return JsonResponse({'error': 'No removed cards available to deal.'}, status=404)

    # Randomly select a card from the removed cards list
    card_to_deal = random.choice(lobby.removed_cards)

    # Assign the card to the player
    player.ninja_cards.append(card_to_deal)  # Add the card to the player's ninja cards
    player.save()

    # Remove the card from the removed cards list
    lobby.removed_cards.remove(card_to_deal)
    lobby.save()

    return JsonResponse({
        'status': 'Card successfully dealt to the player.',
        'dealt_card': card_to_deal
    })