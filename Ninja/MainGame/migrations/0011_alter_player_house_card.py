# Generated by Django 5.1.4 on 2024-12-24 20:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0010_player_house_card_player_ninja_cards'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='house_card',
            field=models.CharField(max_length=255, null=True),
        ),
    ]