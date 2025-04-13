from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import viewsets
from .serializers import UserRegistrationSerializer, NoteSerializer, DoctorSerializer, AppointmentSerializer , EmergencySerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer,ProfileSerializer,ConsultancySerializer
from .models import Note, Profile, Doctor, Appointment ,Consultancy , Emergency
from rest_framework.response import Response

# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_queryset(self):
        user=self.get_queryset()
        return Note.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        if(serializer.is_valid()):
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)
        


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this view

    def get_queryset(self):
        user=self.get_queryset()
        return Note.objects.filter(user=self.request.user)


    
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account

    
class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer  # use correct serializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)
    
class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            return Doctor.objects.filter(specialization=specialization)
        return Doctor.objects.all()

class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the patient profile from the authenticated user
        patient_profile = self.request.user.profile
        # Set the appointment fee from the selected doctor
        doctor = Doctor.objects.get(id=self.request.data['doctor'])
        serializer.save(
            patient=patient_profile,
            appointment_fee=doctor.consultation_fee
        )

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print("Error creating appointment:", str(e))
            raise

class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user.profile)
    
class ConsultancyViewSet(viewsets.ModelViewSet):
    queryset = Consultancy.objects.all().order_by('-created_at')
    serializer_class = ConsultancySerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            print(f"Creating consultation for user: {request.user.username}")
            
            # Get or create the patient profile
            try:
                patient_profile = request.user.profile
                print(f"Found existing profile: {patient_profile.id}")
            except Profile.DoesNotExist:
                print("Profile does not exist, creating new profile")
                # Create profile if it doesn't exist
                patient_profile = Profile.objects.create(
                    user=request.user,
                    first_name=request.user.first_name or "Not Set",
                    last_name=request.user.last_name or "Not Set",
                    email=request.user.email or "notset@example.com",
                    address="To be updated",
                    phone="To be updated"
                )
                print(f"Created new profile: {patient_profile.id}")
            
            # Get the first available doctor
            doctor = Doctor.objects.first()
            if not doctor:
                print("No doctors available")
                return Response({"error": "No doctors available"}, status=400)
            print(f"Found doctor: {doctor.id}")

            # Create mutable copy of request data
            mutable_data = request.data.copy()
            print(f"Request data: {mutable_data}")
            
            # Add required fields
            mutable_data['patient'] = patient_profile.id
            mutable_data['doctor'] = doctor.id
            print(f"Updated data with patient and doctor: {mutable_data}")

            # Validate and save
            serializer = self.get_serializer(data=mutable_data)
            if not serializer.is_valid():
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=400)
            
            self.perform_create(serializer)
            print(f"Successfully created consultation: {serializer.data}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers)
            
        except Exception as e:
            print(f"Error creating consultation: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=400)

    def get_queryset(self):
        try:
            profile = self.request.user.profile
            return Consultancy.objects.filter(patient=profile)
        except Profile.DoesNotExist:
            print(f"No profile found for user: {self.request.user.username}")
            return Consultancy.objects.none()
        

class EmergencyViewSet(viewsets.ModelViewSet):
    queryset = Emergency.objects.all().order_by('-request_time')
    serializer_class = EmergencySerializer
    permission_classes = [IsAuthenticated]