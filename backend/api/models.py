from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    email= models.EmailField(max_length=100, null=True)
    adhaar_number = models.CharField(max_length=12, unique=True, null=True)
    patient_type = models.CharField(max_length=50,default="TBE")  # Example: 'inpatient' or 'outpatient'
    dob = models.DateField(null=True)
    gender = models.CharField(max_length=10, null=True)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    
    class Meta:
        db_table = 'Patient'  # 🧠 Custom table name here

    def __str__(self):
        return f"{self.user.username}'s profile"

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name='notes')

    def __str__(self):
        return self.title
