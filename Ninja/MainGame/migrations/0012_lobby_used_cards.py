# Generated by Django 5.1.4 on 2024-12-26 14:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0011_alter_player_house_card'),
    ]

    operations = [
        migrations.AddField(
            model_name='lobby',
            name='used_cards',
            field=models.JSONField(default=list),
        ),
    ]