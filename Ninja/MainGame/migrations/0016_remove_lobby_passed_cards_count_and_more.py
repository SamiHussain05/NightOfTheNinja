# Generated by Django 5.1.4 on 2025-01-01 02:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0015_lobby_queued_cards'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='lobby',
            name='passed_cards_count',
        ),
        migrations.RemoveField(
            model_name='lobby',
            name='queued_cards',
        ),
    ]
