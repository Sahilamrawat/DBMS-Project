from django.db import migrations
import json
import random
import string
from django.utils import timezone

def generate_doctor_id():
    year = timezone.now().strftime('%Y')
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f'DOC{year}{random_digits}'

def add_sample_doctors(apps, schema_editor):
    Doctor = apps.get_model('api', 'Doctor')
    sample_doctors = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'qualification': 'MD, DM (Cardiology)',
            'specialization': 'Cardiologist',
            'schedule': json.dumps({
                'Monday': '9:00 AM - 5:00 PM',
                'Wednesday': '9:00 AM - 5:00 PM',
                'Friday': '9:00 AM - 5:00 PM'
            }),
            'contact_info': '+91 9876543210',
            'experience_years': 15,
            'consultation_fee': 1500.00,
            'bio': 'Experienced cardiologist with expertise in interventional cardiology.'
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'qualification': 'MD, DNB (Dermatology)',
            'specialization': 'Dermatologist',
            'schedule': json.dumps({
                'Tuesday': '10:00 AM - 6:00 PM',
                'Thursday': '10:00 AM - 6:00 PM',
                'Saturday': '9:00 AM - 2:00 PM'
            }),
            'contact_info': '+91 9876543211',
            'experience_years': 12,
            'consultation_fee': 1200.00,
            'bio': 'Specialized in cosmetic dermatology and skin cancer treatments.'
        },
        {
            'first_name': 'Michael',
            'last_name': 'Chen',
            'qualification': 'MS (Orthopedics)',
            'specialization': 'Orthopedic Surgeon',
            'schedule': {
                'Monday': '2:00 PM - 8:00 PM',
                'Thursday': '2:00 PM - 8:00 PM',
                'Saturday': '10:00 AM - 4:00 PM'
            },
            'contact_info': '+91 9876543212',
            'experience_years': 18,
            'consultation_fee': '2000.00',
            'bio': 'Expert in joint replacement surgery and sports medicine.'
        },
        {
            'first_name': 'Emily',
            'last_name': 'Wilson',
            'qualification': 'MD (Pediatrics)',
            'specialization': 'Pediatrician',
            'schedule': {
                'Monday': '9:00 AM - 4:00 PM',
                'Wednesday': '9:00 AM - 4:00 PM',
                'Friday': '9:00 AM - 4:00 PM'
            },
            'contact_info': '+91 9876543213',
            'experience_years': 10,
            'consultation_fee': '1000.00',
            'bio': 'Dedicated to providing comprehensive care for children from newborns to adolescents.'
        },
        {
            'first_name': 'David',
            'last_name': 'Brown',
            'qualification': 'MD, DM (Neurology)',
            'specialization': 'Neurologist',
            'schedule': {
                'Tuesday': '9:00 AM - 5:00 PM',
                'Thursday': '9:00 AM - 5:00 PM',
                'Saturday': '9:00 AM - 2:00 PM'
            },
            'contact_info': '+91 9876543214',
            'experience_years': 20,
            'consultation_fee': '2500.00',
            'bio': 'Specializes in treating neurological disorders and stroke management.'
        },
        {
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'qualification': 'MD (Psychiatry)',
            'specialization': 'Psychiatrist',
            'schedule': {
                'Monday': '11:00 AM - 7:00 PM',
                'Wednesday': '11:00 AM - 7:00 PM',
                'Friday': '11:00 AM - 7:00 PM'
            },
            'contact_info': '+91 9876543215',
            'experience_years': 14,
            'consultation_fee': '1800.00',
            'bio': 'Experienced in treating anxiety, depression, and other mental health conditions.'
        },
        {
            'first_name': 'Robert',
            'last_name': 'Taylor',
            'qualification': 'MS (Ophthalmology)',
            'specialization': 'Ophthalmologist',
            'schedule': {
                'Tuesday': '9:00 AM - 6:00 PM',
                'Thursday': '9:00 AM - 6:00 PM',
                'Saturday': '9:00 AM - 3:00 PM'
            },
            'contact_info': '+91 9876543216',
            'experience_years': 16,
            'consultation_fee': '1300.00',
            'bio': 'Specialist in cataract surgery and retinal diseases.'
        },
        {
            'first_name': 'Lisa',
            'last_name': 'Anderson',
            'qualification': 'MD (ENT)',
            'specialization': 'ENT Specialist',
            'schedule': {
                'Monday': '10:00 AM - 6:00 PM',
                'Wednesday': '10:00 AM - 6:00 PM',
                'Friday': '10:00 AM - 6:00 PM'
            },
            'contact_info': '+91 9876543217',
            'experience_years': 13,
            'consultation_fee': '1400.00',
            'bio': 'Expert in treating ear, nose, and throat conditions.'
        },
        {
            'first_name': 'James',
            'last_name': 'Williams',
            'qualification': 'MD, DM (Endocrinology)',
            'specialization': 'Endocrinologist',
            'schedule': {
                'Tuesday': '8:00 AM - 4:00 PM',
                'Thursday': '8:00 AM - 4:00 PM',
                'Saturday': '8:00 AM - 2:00 PM'
            },
            'contact_info': '+91 9876543218',
            'experience_years': 17,
            'consultation_fee': '1600.00',
            'bio': 'Specialized in diabetes management and thyroid disorders.'
        },
        {
            'first_name': 'Anna',
            'last_name': 'Martinez',
            'qualification': 'MD (Gynecology)',
            'specialization': 'Gynecologist',
            'schedule': {
                'Monday': '9:00 AM - 5:00 PM',
                'Wednesday': '9:00 AM - 5:00 PM',
                'Friday': '9:00 AM - 5:00 PM'
            },
            'contact_info': '+91 9876543219',
            'experience_years': 19,
            'consultation_fee': '1700.00',
            'bio': 'Experienced in women\'s health and reproductive medicine.'
        }
    ]

    for doctor_data in sample_doctors:
        # Generate a unique doctor_id
        while True:
            doctor_id = generate_doctor_id()
            if not Doctor.objects.filter(doctor_id=doctor_id).exists():
                doctor_data['doctor_id'] = doctor_id
                break
        Doctor.objects.create(**doctor_data)

def remove_sample_doctors(apps, schema_editor):
    Doctor = apps.get_model('api', 'Doctor')
    Doctor.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0010_doctor_appointment'),  # Update this to your last migration
    ]

    operations = [
        migrations.RunPython(add_sample_doctors, remove_sample_doctors),
    ]