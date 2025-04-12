from django.db import migrations
from django.utils import timezone
import random
import string

def generate_unique_patient_id(Profile):
    year = timezone.now().strftime('%Y')
    while True:
        random_digits = ''.join(random.choices(string.digits, k=4))
        new_id = f'PAT{year}{random_digits}'
        if not Profile.objects.filter(patient_id=new_id).exists():
            return new_id

def generate_patient_ids(apps, schema_editor):
    Profile = apps.get_model('api', 'Profile')
    db_alias = schema_editor.connection.alias
    
    # Get all profiles without patient IDs
    profiles = Profile.objects.using(db_alias).filter(patient_id__isnull=True)
    
    for profile in profiles:
        profile.patient_id = generate_unique_patient_id(Profile)
        profile.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0008_profile_patient_id'),
    ]

    operations = [
        migrations.RunPython(generate_patient_ids, reverse_code=migrations.RunPython.noop),
    ]
