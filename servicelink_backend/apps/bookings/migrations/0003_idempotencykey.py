from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('bookings', '0002_review'),
    ]

    operations = [
        migrations.CreateModel(
            name='IdempotencyKey',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idempotency_key', models.UUIDField(db_index=True)),
                ('request_hash', models.CharField(max_length=64)),
                ('response_data', models.JSONField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='idempotency_keys', to='accounts.user')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'idempotency_key')},
            },
        ),
    ]
