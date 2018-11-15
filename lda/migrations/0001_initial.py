# Generated by Django 2.1.3 on 2018-11-15 01:14

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('dataset_type', models.IntegerField(choices=[(1, 'Medium Articles'), (2, 'Reuters News')])),
            ],
        ),
    ]
