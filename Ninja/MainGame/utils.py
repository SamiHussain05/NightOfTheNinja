# from random import shuffle
# import logging

# # Set up logging
# logger = logging.getLogger(__name__)

# def assign_cards_to_players(game):
#     players = list(game.players.all())  # Get all players in the game
#     shuffle(players)  # Randomize the player order

#     # Define the house cards: Lotus 1-4 and Crane 1-4
#     house_cards = ["Lotus 1", "Lotus 2", "Lotus 3", "Lotus 4", "Crane 1", "Crane 2", "Crane 3", "Crane 4"]
#     shuffle(house_cards)  # Shuffle the house cards
#     logger.info(f"House cards shuffled: {house_cards}")

#     # Assign house cards to players
#     for i, player in enumerate(players):
#         if i < len(house_cards):
#             player.house_card = house_cards[i]  # Assign house card to the player
#             player.save()
#             logger.info(f"Assigned house card {house_cards[i]} to player {player.user.username}")

#     # Define the ninja cards: 4 of each type
#     ninja_deck = [
#         "Mystic 1", "Mystic 2", "Mystic 3", "Mystic 4", 
#         "Blind Assassin 1", "Blind Assassin 2", "Blind Assassin 3", "Blind Assassin 4",
#         "Spy 1", "Spy 2", "Spy 3", "Spy 4",
#         "Shinobi 1", "Shinobi 2", "Shinobi 3", "Shinobi 4",
#         "Trickster 1", "Trickster 2", "Trickster 3", "Trickster 4"
#     ]
#     shuffle(ninja_deck)  # Shuffle the ninja cards
#     logger.info(f"Ninja cards shuffled: {ninja_deck}")

#     # Function to determine the value for each card (You can adjust this as needed)
#     def get_card_value(card_name):
#         # Here, you can implement your logic to assign values based on card type.
#         # For simplicity, let's set a fixed value for each type.
#         if "Mystic" in card_name:
#             return 3
#         elif "Blind Assassin" in card_name:
#             return 2
#         elif "Spy" in card_name:
#             return 1
#         elif "Shinobi" in card_name:
#             return 5
#         elif "Trickster" in card_name:
#             return 4
#         return 1  # Default value if card type isn't matched

#     # Assign 2 ninja cards to each player
#     for player in players:
#         for _ in range(2):  # Each player gets 2 ninja cards
#             if ninja_deck:
#                 card_name = ninja_deck.pop()
#                 card_value = get_card_value(card_name)  # Get the card value
#                 card = game.cards.create(card_type=card_name, owner=player, value=card_value)
#                 card.save()
#                 logger.info(f"Assigned ninja card {card_name} (value: {card_value}) to player {player.user.username}")
#             else:
#                 logger.warning(f"No more ninja cards available to assign to player {player.user.username}")

# utils.py
from random import shuffle

def assign_cards_to_players(game):
    # Example cards as strings (you can change this to suit your game)
    house_cards = ["Lotus 1", "Lotus 2", "Lotus 3", "Lotus 4", "Crane 1", "Crane 2", "Crane 3", "Crane 4"]
    ninja_cards = [
        "Mystic 1", "Mystic 2", "Mystic 3", "Mystic 4",
        "Blind Assassin 1", "Blind Assassin 2", "Blind Assassin 3", "Blind Assassin 4",
        "Spy 1", "Spy 2", "Spy 3", "Spy 4",
        "Shinobi 1", "Shinobi 2", "Shinobi 3", "Shinobi 4",
        "Trickster 1", "Trickster 2", "Trickster 3", "Trickster 4"
    ]
    
    shuffle(house_cards)
    shuffle(ninja_cards)

    # Iterate over each player and assign cards
    for player in game.players:
        if house_cards:
            player["house_card"] = house_cards.pop()  # Assign a house card
        player["ninja_cards"] = [ninja_cards.pop(), ninja_cards.pop()]  # Assign two ninja cards
    
    # Save the updated players' data in the game model
    game.save()



