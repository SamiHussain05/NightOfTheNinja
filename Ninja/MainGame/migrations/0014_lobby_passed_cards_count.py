# Generated by Django 5.1.4 on 2025-01-01 01:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0013_lobby_removed_cards'),
    ]

    operations = [
        migrations.AddField(
            model_name='lobby',
            name='passed_cards_count',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
