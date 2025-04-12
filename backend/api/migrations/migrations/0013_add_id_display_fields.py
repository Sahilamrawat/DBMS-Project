from django.db import migrations, models

def update_display_ids(apps, schema_editor):
    Appointment = apps.get_model('api', 'Appointment')
    for appointment in Appointment.objects.all():
        try:
            appointment.patient_id_display = appointment.patient.patient_id
            appointment.doctor_id_display = appointment.doctor.doctor_id
            appointment.save()
        except Exception as e:
            print(f"Error updating appointment {appointment.id}: {str(e)}")

def reverse_update_display_ids(apps, schema_editor):
    Appointment = apps.get_model('api', 'Appointment')
    Appointment.objects.all().update(patient_id_display=None, doctor_id_display=None)

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0012_update_ids'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='patient_id_display',
            field=models.CharField(max_length=15, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='doctor_id_display',
            field=models.CharField(max_length=15, editable=False, null=True),
        ),
        migrations.RunPython(
            update_display_ids,
            reverse_code=reverse_update_display_ids
        ),
    ]
