from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import random
import string
# Create your models here.

def generate_unique_patient_id():
    year = timezone.now().strftime('%Y')
    while True:
        random_digits = ''.join(random.choices(string.digits, k=4))
        new_id = f'PAT{year}{random_digits}'
        if not Profile.objects.filter(patient_id=new_id).exists():
            return new_id

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    patient_id = models.CharField(max_length=15, unique=True, editable=False, null=True)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    email = models.EmailField(max_length=100, null=True)
    adhaar_number = models.CharField(max_length=12, unique=True, null=True)
    patient_type = models.CharField(max_length=50, default="TBE")  # Example: 'inpatient' or 'outpatient'
    dob = models.DateField(null=True)
    gender = models.CharField(max_length=10, null=True)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    blood_group = models.CharField(max_length=5, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    emergency_contact = models.CharField(max_length=15, null=True, blank=True)
    insurance_status = models.CharField(max_length=20, null=True, blank=True)
    insurance_number = models.CharField(max_length=50, null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    medical_conditions = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    class Meta:
        db_table = 'Patient'  # 🧠 Custom table name here

    def __str__(self):
        return f"{self.patient_id} - {self.user.username}'s profile"

    def save(self, *args, **kwargs):
        if not self.patient_id:
            self.patient_id = generate_unique_patient_id()
        super(Profile, self).save(*args, **kwargs)

# Signal to create profile when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Signal to save profile when user is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name='notes')

    def __str__(self):
        return self.title

class Doctor(models.Model):
    doctor_id = models.CharField(max_length=15, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    specialization = models.CharField(max_length=100)
    schedule = models.JSONField()  # Store working hours and days
    contact_info = models.CharField(max_length=100)
    image = models.ImageField(upload_to='doctor_images/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'Doctor'

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} - {self.specialization}"

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            year = timezone.now().strftime('%Y')
            while True:
                random_digits = ''.join(random.choices(string.digits, k=4))
                new_id = f'DOC{year}{random_digits}'
                if not Doctor.objects.filter(doctor_id=new_id).exists():
                    self.doctor_id = new_id
                    break
        super().save(*args, **kwargs)

class Appointment(models.Model):
    APPOINTMENT_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
    ]
    
    APPOINTMENT_MODE = [
        ('ONLINE', 'Online'),
        ('IN_PERSON', 'In Person'),
    ]

    appointment_id = models.CharField(max_length=15, unique=True, editable=False)
    patient = models.ForeignKey(Profile, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient_id_display = models.CharField(max_length=15, editable=False, null=True)
    doctor_id_display = models.CharField(max_length=15, editable=False, null=True)
    appointment_date = models.DateTimeField()
    appoint_status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS, default='SCHEDULED')
    appointment_fee = models.DecimalField(max_digits=10, decimal_places=2)
    appointment_mode = models.CharField(max_length=20, choices=APPOINTMENT_MODE, default='IN_PERSON')
    symptoms = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'Appointment'

    def __str__(self):
        return f"{self.appointment_id} - Patient: {self.patient_id_display or 'N/A'} - Doctor: {self.doctor_id_display or 'N/A'}"

    def save(self, *args, **kwargs):
        if not self.appointment_id:
            year = timezone.now().strftime('%Y')
            while True:
                random_digits = ''.join(random.choices(string.digits, k=4))
                new_id = f'APT{year}{random_digits}'
                if not Appointment.objects.filter(appointment_id=new_id).exists():
                    self.appointment_id = new_id
                    break
        if self.patient and self.patient.patient_id:
            self.patient_id_display = self.patient.patient_id
        if self.doctor and self.doctor.doctor_id:
            self.doctor_id_display = self.doctor.doctor_id
        super().save(*args, **kwargs)


class Consultancy(models.Model):
    CONSULTATION_TYPE_CHOICES = [
        ('Chat', 'Chat'),
        ('Audio call', 'Audio call'),
        ('Video Call', 'Video Call'),
    ]

    consult_id = models.AutoField(primary_key=True)
    patient = models.ForeignKey(Profile, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient_id_display = models.CharField(max_length=15, editable=False, null=True, blank=True)
    doctor_id_display = models.CharField(max_length=15, editable=False, null=True, blank=True)
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPE_CHOICES)
    
    # Medical History Fields
    diagnosis = models.TextField(null=True, blank=True)
    treatment = models.TextField(null=True, blank=True)
    allergies = models.TextField(null=True, blank=True)
    past_surgeries = models.TextField(null=True, blank=True)
    previous_medications = models.TextField(null=True, blank=True)
    
    # Consultation Details
    consultation_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Consultancy'
        managed = True  # Explicitly set managed to True

    def __str__(self):
        return f"Consultancy {self.consult_id} - {self.patient} with Dr. {self.doctor.last_name}"

    def save(self, *args, **kwargs):
        if self.patient and self.patient.patient_id:
            self.patient_id_display = self.patient.patient_id
        if self.doctor and self.doctor.doctor_id:
            self.doctor_id_display = self.doctor.doctor_id
        super().save(*args, **kwargs)

class Emergency(models.Model):
    STATUS_CHOICES = [('Pending', 'Pending'), ('Arrived', 'Arrived'), ('Completed', 'Completed')]
    YES_NO_CHOICES = [('Yes', 'Yes'), ('No', 'No')]

    patient = models.ForeignKey('Patient', on_delete=models.CASCADE)
    doctor = models.ForeignKey('Doctor', on_delete=models.SET_NULL, null=True, blank=True)
    request_time = models.DateTimeField(auto_now_add=True)
    ambulance_assign_status = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    ambulance_assigned = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    arrival_time_in_hospital = models.DateTimeField(null=True, blank=True)
    driver_name = models.CharField(max_length=50, null=True, blank=True)
    driver_contact_num = models.CharField(max_length=15, null=True, blank=True)
    legal_issues_reported = models.CharField(max_length=3, choices=YES_NO_CHOICES)
    legal_case_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"Emergency for Patient {self.patient.id} - {self.status}"