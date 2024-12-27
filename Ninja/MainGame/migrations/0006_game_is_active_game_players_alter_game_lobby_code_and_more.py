# Generated by Django 5.1.4 on 2024-12-24 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0005_alter_player_unique_together_remove_card_game_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='game',
            name='players',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='game',
            name='lobby_code',
            field=models.CharField(max_length=10, unique=True),
        ),
        migrations.DeleteModel(
            name='Player',
        ),
    ]