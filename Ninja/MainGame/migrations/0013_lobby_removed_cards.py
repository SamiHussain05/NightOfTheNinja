# Generated by Django 5.1.4 on 2024-12-27 23:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainGame', '0012_lobby_used_cards'),
    ]

    operations = [
        migrations.AddField(
            model_name='lobby',
            name='removed_cards',
            field=models.JSONField(default=list),
        ),
    ]
