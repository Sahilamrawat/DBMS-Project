from django.db import migrations
from django.utils import timezone
import random
import string

def generate_unique_id(prefix, model):
    year = timezone.now().strftime('%Y')
    while True:
        random_digits = ''.join(random.choices(string.digits, k=4))
        new_id = f'{prefix}{year}{random_digits}'
        if not model.objects.filter(**{f'{prefix.lower()}_id': new_id}).exists():
            return new_id

def update_ids(apps, schema_editor):
    Doctor = apps.get_model('api', 'Doctor')
    Appointment = apps.get_model('api', 'Appointment')
    Profile = apps.get_model('api', 'Profile')

    # Update doctors without IDs
    for doctor in Doctor.objects.filter(doctor_id__isnull=True):
        doctor.doctor_id = generate_unique_id('DOC', Doctor)
        doctor.save()

    # Update appointments without IDs
    for appointment in Appointment.objects.filter(appointment_id__isnull=True):
        appointment.appointment_id = generate_unique_id('APT', Appointment)
        appointment.save()

    # Update profiles without IDs
    for profile in Profile.objects.filter(patient_id__isnull=True):
        profile.patient_id = generate_unique_id('PAT', Profile)
        profile.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0011_add_sample_doctors'),  # Update this to your last migration
    ]

    operations = [
        migrations.RunPython(update_ids),
    ]
