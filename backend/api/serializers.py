from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Profile, Doctor, Appointment , Consultancy ,Emergency
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        print("Login attempt:",username, password)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        
        return super().validate(attrs)


class UserRegistrationSerializer(serializers.ModelSerializer):
    # New Profile Fields
    username = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email=serializers.EmailField(write_only=True);
    adhaar_number = serializers.CharField(write_only=True)
    patient_type = serializers.CharField(write_only=True)
    dob = serializers.DateField(write_only=True)
    gender = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'adhaar_number',
            'patient_type', 'dob', 'gender', 'phone', 'address'
        ]
    def create(self, validated_data):
        profile_data = {
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'email': validated_data.pop('email'),
            'adhaar_number': validated_data.pop('adhaar_number'),
            'patient_type': validated_data.pop('patient_type'),
            'dob': validated_data.pop('dob'),
            'gender': validated_data.pop('gender'),
            'phone': validated_data.pop('phone'),
            'address': validated_data.pop('address'),
        }
        
        password = validated_data.pop('password')
        print("Creating user with data:", validated_data)

        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Create Profile
        Profile.objects.create(user=user, **profile_data)

        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'patient_id', 'first_name', 'last_name', 'email', 'adhaar_number',
            'patient_type', 'dob', 'gender', 'phone', 'address', 
            'blood_group', 'height', 'weight', 'emergency_contact',
            'insurance_status', 'insurance_number', 'allergies',
            'medical_conditions', 'created_at'
        ]
        read_only_fields = ['patient_id']  # Make patient_id read-only
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at', 'user']
        extra_kwargs = {"user": {"read_only": True}}

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'doctor_id', 'first_name', 'last_name', 'qualification', 
                 'specialization', 'schedule', 'contact_info', 'image', 'bio', 
                 'experience_years', 'consultation_fee']

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'appointment_id', 
            'doctor', 'doctor_id_display', 'doctor_name',
            'patient', 'patient_id_display', 'patient_name',
            'appointment_date', 'appointment_mode', 
            'appoint_status', 'appointment_fee',
            'symptoms', 'notes', 'created_at'
        ]
        read_only_fields = ['appointment_id', 'patient', 'appointment_fee', 
                           'patient_id_display', 'doctor_id_display']

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"
    
class ConsultancySerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Consultancy
        fields = [
            'consult_id',
            'patient',
            'doctor',
            'patient_name',
            'doctor_name',
            'consultation_type',
            'consultation_notes',
            'created_at'
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}" if obj.patient else None

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}" if obj.doctor else None

class EmergencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Emergency
        fields = '__all__'