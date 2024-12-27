# urls.py
from django.urls import path
from MainGame import views
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls), 
    path('create-lobby/', views.create_lobby),
    path('reshuffle/<str:lobby_code>/', views.reshuffle_deck, name='reshuffle_deck'),
    path('join-lobby/<str:lobby_code>/', views.join_lobby),
    path('shuffle-deal/<str:lobby_code>/', views.shuffle_and_deal),
    path('get-players/<str:lobby_code>/', views.get_players, name='get_players'),
    path('get-player-cards/<str:lobby_code>/<int:player_id>/', views.get_player_cards, name='get_player_cards'),
    path('delete-lobby/<str:lobby_code>/', views.delete_lobby, name='delete_lobby'),
    path('discard-and-redistribute/<str:lobby_code>/<int:player_id>/', views.discard_and_redistribute, name='discard_and_redistribute'),
    path('remove-card/<str:lobby_code>/<int:player_id>/', views.remove_card, name='remove_card'),
    path('get-used-cards/<str:lobby_code>/<int:player_id>/', views.use_card, name='use_card'),
    path('get-used-cards/<str:lobby_code>/', views.get_used_cards, name='get_used_cards'),
    path('clear-used-cards/<str:lobby_code>/', views.clear_used_cards, name='clear_used_cards'),
    path('get-removed-cards/<str:lobby_code>/', views.get_removed_cards, name='get_removed_cards'),
    path('deal-removed-card/<str:lobby_code>/', views.deal_removed_card, name='deal_removed_card'),
]
