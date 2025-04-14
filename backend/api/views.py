from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework import viewsets
from .serializers import UserRegistrationSerializer, NoteSerializer, DoctorSerializer, AppointmentSerializer, EmergencySerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer, ProfileSerializer, ConsultancySerializer
from .models import execute_query
from rest_framework.response import Response
from django.http import JsonResponse
import json
from django.utils import timezone
import random
import string
from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime
from django.utils.dateparse import parse_datetime
from django.db import connection


# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            # Get user from database
            query = """
                SELECT 
                    id, username, password, email, first_name, last_name, is_active,
                    date_joined,  -- Remove DATE_FORMAT for these fields
                    last_login
                FROM auth_user
                WHERE username = %s
            """
            users = execute_query(query, [request.data.get('username')])
            
            if not users:
                return Response(
                    {"detail": "No active account found with the given credentials"},
                    status=401
                )
            
            user = users[0]  # Get the first user
            
            # Check if user is active
            if not user['is_active']:
                return Response(
                    {"detail": "Account is not active"},
                    status=401
                )
            
            # Verify password
            if not check_password(request.data.get('password'), user['password']):
                return Response(
                    {"detail": "No active account found with the given credentials"},
                    status=401
                )
            
            # Get user type from profile
            query = """
                SELECT user_type FROM api_profile
                WHERE user_id = %s
            """
            profiles = execute_query(query, [user['id']])
            user_type = profiles[0]['user_type'] if profiles else 'PATIENT'
            
            # Create a Django User instance with proper datetime fields
            django_user = User(
                id=user['id'],
                username=user['username'],
                email=user['email'],
                first_name=user['first_name'],
                last_name=user['last_name'],
                is_active=user['is_active'],
                password=user['password'],  # Password is already hashed
                date_joined=user['date_joined'] if user['date_joined'] else datetime.now(),
                last_login=user['last_login']
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(django_user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'user_type': user_type
                }
            })
            
        except Exception as e:
            print("Login error:", str(e))  # Add error logging
            return Response({"detail": "Invalid credentials"}, status=401)

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = """
            SELECT * FROM Note 
            WHERE user_id = %s
        """
        return execute_query(query, [self.request.user.id])

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user_id=self.request.user.id)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = """
            SELECT * FROM Note 
            WHERE user_id = %s
        """
        return execute_query(query, [self.request.user.id])

    def perform_destroy(self, instance):
        query = """
            DELETE FROM Note 
            WHERE id = %s AND user_id = %s
        """
        execute_query(query, [instance['id'], self.request.user.id], fetch=False)

class CreateUserView(generics.CreateAPIView):
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            # Start transaction
            execute_query("START TRANSACTION", [], fetch=False)

            # Check if username already exists
            query = """
                SELECT id FROM auth_user 
                WHERE username = %s
            """
            existing_user = execute_query(query, [request.data.get('username')])
            
            if existing_user:
                execute_query("ROLLBACK", [], fetch=False)
                return Response(
                    {"error": "Username already exists"},
                    status=400
                )

            # Create user in auth_user table
            query = """
                INSERT INTO auth_user (
                    username, password, email, first_name, last_name, 
                    is_active, is_staff, is_superuser, date_joined
                ) VALUES (%s, %s, %s, %s, %s, TRUE, FALSE, FALSE, NOW())
            """
            params = [
                request.data.get('username'),
                make_password(request.data.get('password')),
                request.data.get('email'),
                request.data.get('first_name', ''),
                request.data.get('last_name', '')
            ]
            
            execute_query(query, params, fetch=False)
            
            # Get the last inserted id
            query = "SELECT LAST_INSERT_ID() as id"
            result = execute_query(query, [])
            user_id = result[0]['id']
            
            # Create profile
            query = """
                INSERT INTO api_profile (
                    user_id, phone, address, date_of_birth, gender,
                    blood_group, height, weight, emergency_contact,
                    insurance_status, insurance_number, allergies, medical_conditions,
                    user_type, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            # Format date of birth if provided
            dob = request.data.get('date_of_birth') or request.data.get('dob')  # Try both field names
            if dob:
                try:
                    # Parse the date string to ensure it's in the correct format
                    dob = datetime.strptime(dob, '%Y-%m-%d').strftime('%Y-%m-%d')
                except ValueError:
                    dob = None

            params = [
                user_id,
                request.data.get('phone', ''),
                request.data.get('address', ''),
                dob,  # Use the formatted date
                request.data.get('gender', 'OTHER'),
                request.data.get('blood_group'),
                request.data.get('height'),
                request.data.get('weight'),
                request.data.get('emergency_contact'),
                request.data.get('insurance_status', 'Not Insured'),
                request.data.get('insurance_number'),
                request.data.get('allergies'),
                request.data.get('medical_conditions'),
                request.data.get('user_type', 'PATIENT')
            ]
            
            execute_query(query, params, fetch=False)
            
            user_type = request.data.get('user_type', 'PATIENT')
            
            if user_type == 'PATIENT':
                # Generate unique patient ID
                year = timezone.now().strftime('%Y')
                while True:
                    random_digits = ''.join(random.choices(string.digits, k=4))
                    patient_id = f'PAT{year}{random_digits}'
                    
                    query = """
                        SELECT COUNT(*) as count FROM api_patient 
                        WHERE patient_id = %s
                    """
                    count = execute_query(query, [patient_id])[0]['count']
                    
                    if count == 0:
                        break

                # Create patient record
                query = """
                    INSERT INTO api_patient (
                        user_id, patient_id, adhaar_number, patient_type,
                        created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, NOW(), NOW())
                """
                params = [
                    user_id,
                    patient_id,
                    request.data.get('adhaar_number'),
                    request.data.get('patient_type', 'outpatient')
                ]
                
                execute_query(query, params, fetch=False)
                
            elif user_type == 'DOCTOR':
                # Generate unique doctor ID
                year = timezone.now().strftime('%Y')
                while True:
                    random_digits = ''.join(random.choices(string.digits, k=4))
                    doctor_id = f'DOC{year}{random_digits}'
                    
                    query = """
                        SELECT COUNT(*) as count FROM api_doctor 
                        WHERE doctor_id = %s
                    """
                    count = execute_query(query, [doctor_id])[0]['count']
                    
                    if count == 0:
                        break

                # Create doctor record
                query = """
                    INSERT INTO api_doctor (
                        user_id, doctor_id, specialization, consultation_fee,
                        created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, NOW(), NOW())
                """
                params = [
                    user_id,
                    doctor_id,
                    request.data.get('specialization', 'GENERAL'),
                    request.data.get('consultation_fee', 500)
                ]
                
                execute_query(query, params, fetch=False)

            # Commit transaction
            execute_query("COMMIT", [], fetch=False)
            
            return Response({
                "message": "User registered successfully",
                "user_id": user_id,
                "user_type": user_type
            }, status=201)
            
        except Exception as e:
            # Rollback transaction on error
            execute_query("ROLLBACK", [], fetch=False)
            return Response({"error": str(e)}, status=400)

class ProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get user details with all fields
            query = """
                SELECT 
                    id, username, email, first_name, last_name,
                    is_active, is_staff, is_superuser,
                    date_joined, last_login
                FROM auth_user 
                WHERE id = %s
            """
            users = execute_query(query, [request.user.id])
            
            if not users:
                return Response(
                    {"detail": "User not found"},
                    status=404
                )
            
            user = users[0]
            
            # Get profile details with all fields
            query = """
                SELECT 
                    id, user_id, phone, address, 
                    date_of_birth, gender, blood_group, 
                    height, weight, emergency_contact,
                    insurance_status, insurance_number,
                    allergies, medical_conditions,
                    user_type, profile_picture,
                    created_at, updated_at
                FROM api_profile 
                WHERE user_id = %s
            """
            profiles = execute_query(query, [request.user.id])
            
            if not profiles:
                return Response(
                    {"detail": "Profile not found"},
                    status=404
                )
            
            profile = profiles[0]
            
            # Get patient details if user is a patient
            patient_data = None
            if profile['user_type'] == 'PATIENT':
                query = """
                    SELECT 
                        id, patient_id, adhaar_number,
                        patient_type, registration_date,
                        last_visit_date, next_appointment_date,
                        medical_history, current_medications,
                        family_history, lifestyle_factors,
                        vaccination_history
                    FROM api_patient 
                    WHERE user_id = %s
                """
                patients = execute_query(query, [request.user.id])
                if patients:
                    patient_data = patients[0]
            
            # Get doctor details if user is a doctor
            doctor_data = None
            if profile['user_type'] == 'DOCTOR':
                query = """
                    SELECT 
                        id, doctor_id, specialization,
                        consultation_fee, experience_years,
                        qualifications, available_days,
                        available_hours, is_available
                    FROM api_doctor 
                    WHERE user_id = %s
                """
                doctors = execute_query(query, [request.user.id])
                if doctors:
                    doctor_data = doctors[0]
            
            # Get notes
            query = """
                SELECT 
                    id, title, content, 
                    created_at, updated_at
                FROM api_note 
                WHERE user_id = %s
            """
            notes = execute_query(query, [request.user.id])
            
            # Get appointments
            query = """
                SELECT 
                    a.id, a.patient_id, a.doctor_id,
                    a.appointment_date, a.symptoms, a.notes,
                    a.status, a.created_at, a.updated_at,
                    CONCAT('Dr. ', du.first_name, ' ', du.last_name) as doctor_name,
                    CONCAT(pu.first_name, ' ', pu.last_name) as patient_name
                FROM api_appointment a
                JOIN api_patient p ON a.patient_id = p.id
                JOIN api_doctor d ON a.doctor_id = d.id
                JOIN auth_user du ON d.user_id = du.id
                JOIN auth_user pu ON p.user_id = pu.id
                WHERE (p.user_id = %s OR d.user_id = %s)
                ORDER BY a.appointment_date DESC
            """
            appointments = execute_query(query, [request.user.id, request.user.id])
            
            # Format appointment dates
            for appointment in appointments:
                if appointment['appointment_date']:
                    appointment['appointment_date'] = appointment['appointment_date'].strftime('%Y-%m-%d %H:%M:%S')
                if appointment['created_at']:
                    appointment['created_at'] = appointment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                if appointment['updated_at']:
                    appointment['updated_at'] = appointment['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            # Get consultations
            query = """
                SELECT 
                    id, patient_id, doctor_id,
                    appointment_id, diagnosis, prescription,
                    follow_up_date, created_at, updated_at
                FROM api_consultancy 
                WHERE patient_id = %s
            """
            consultations = execute_query(query, [request.user.id])
            
            # Get emergencies
            query = """
                SELECT 
                    id, patient_id, doctor_id,
                    emergency_type, severity, symptoms,
                    treatment_given, status,
                    created_at, updated_at
                FROM api_emergency 
                WHERE patient_id = %s
            """
            emergencies = execute_query(query, [request.user.id])
            
            return Response({
                'user': user,
                'profile': profile,
                'patient': patient_data,
                'doctor': doctor_data,
                'notes': notes,
                'appointments': appointments,
                'consultations': consultations,
                'emergencies': emergencies
            })
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=500
            )

    def patch(self, request):
        try:
            # Start transaction
            execute_query("START TRANSACTION", [], fetch=False)

            # Update user details
            query = """
                UPDATE auth_user 
                SET first_name = %s, last_name = %s, email = %s
                WHERE id = %s
            """
            params = [
                request.data.get('first_name'),
                request.data.get('last_name'),
                request.data.get('email'),
                request.user.id
            ]
            execute_query(query, params, fetch=False)

            # Update profile
            query = """
                UPDATE api_profile 
                SET phone = %s,
                    address = %s,
                    date_of_birth = %s,
                    gender = %s,
                    blood_group = %s,
                    height = %s,
                    weight = %s,
                    emergency_contact = %s,
                    insurance_status = %s,
                    insurance_number = %s,
                    allergies = %s,
                    medical_conditions = %s,
                    updated_at = NOW()
                WHERE user_id = %s
            """
            # Format date of birth if provided
            dob = request.data.get('date_of_birth') or request.data.get('dob')  # Try both field names
            if dob:
                try:
                    # Parse the date string to ensure it's in the correct format
                    dob = datetime.strptime(dob, '%Y-%m-%d').strftime('%Y-%m-%d')
                except ValueError:
                    dob = None

            params = [
                request.data.get('phone', ''),
                request.data.get('address', ''),
                dob,  # Use the formatted date
                request.data.get('gender', 'OTHER'),
                request.data.get('blood_group'),
                request.data.get('height'),
                request.data.get('weight'),
                request.data.get('emergency_contact'),
                request.data.get('insurance_status', 'Not Insured'),
                request.data.get('insurance_number'),
                request.data.get('allergies'),
                request.data.get('medical_conditions'),
                request.user.id
            ]
            execute_query(query, params, fetch=False)

            # Update doctor details if user is a doctor
            if request.data.get('user_type') == 'DOCTOR':
                query = """
                    UPDATE api_doctor 
                    SET specialization = %s, consultation_fee = %s,
                        qualifications = %s, experience_years = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """
                params = [
                    request.data.get('specialization'),
                    request.data.get('consultation_fee'),
                    request.data.get('qualifications'),
                    request.data.get('experience_years'),
                    request.user.id
                ]
                execute_query(query, params, fetch=False)

            # Update patient details if user is a patient
            elif request.data.get('user_type') == 'PATIENT':
                query = """
                    UPDATE api_patient 
                    SET patient_type = %s, adhaar_number = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """
                params = [
                    request.data.get('patient_type'),
                    request.data.get('adhaar_number'),
                    request.user.id
                ]
                execute_query(query, params, fetch=False)

            # Commit transaction
            execute_query("COMMIT", [], fetch=False)

            # Return updated profile
            return self.get(request)

        except Exception as e:
            # Rollback transaction on error
            execute_query("ROLLBACK", [], fetch=False)
            return Response({"error": str(e)}, status=400)

class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Optimized query with only necessary fields
            query = """
                SELECT 
                    d.id, d.doctor_id, d.specialization, 
                    d.consultation_fee, d.experience_years,
                    d.qualifications,
                    u.first_name, u.last_name
                FROM api_doctor d
                JOIN auth_user u ON d.user_id = u.id
            """
            
            # Add specialization filter if provided
            params = []
            if request.query_params.get('specialization'):
                specialization = request.query_params.get('specialization')
                query += " WHERE d.specialization = %s"
                params.append(specialization)
            
            # Add ordering for consistent results
            query += " ORDER BY d.experience_years DESC"
            
            doctors = execute_query(query, params)
            
            # Format the response efficiently
            formatted_doctors = [{
                'id': doc['id'],
                'doctor_id': doc['doctor_id'],
                'specialization': doc['specialization'],
                'consultation_fee': doc['consultation_fee'],
                'experience_years': doc['experience_years'],
                'qualifications': doc['qualifications'],
                'first_name': doc['first_name'],
                'last_name': doc['last_name'],
                'full_name': f"Dr. {doc['first_name']} {doc['last_name']}"
            } for doc in doctors]
            
            return Response(formatted_doctors)
            
        except Exception as e:
            print("Error in DoctorListView:", str(e))
            return Response(
                {"detail": str(e)},
                status=500
            )

class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            # Get the patient profile from the authenticated user
            query = """
                SELECT id FROM api_patient 
                WHERE user_id = %s
            """
            patient = execute_query(query, [request.user.id])
            
            if not patient:
                return Response({"detail": "Patient profile not found"}, status=404)
            
            patient_id = patient[0]['id']

            # Get doctor's details including availability
            query = """
                SELECT d.*, u.first_name, u.last_name 
                FROM api_doctor d
                JOIN auth_user u ON d.user_id = u.id
                WHERE d.id = %s
            """
            doctor = execute_query(query, [request.data.get('doctor_id')])
            
            if not doctor:
                return Response({"detail": "Doctor not found"}, status=404)
            
            doctor_data = doctor[0]

            # Validate required fields
            if not request.data.get('appointment_date'):
                return Response({"detail": "Appointment date is required"}, status=400)

            # Parse the appointment date
            try:
                appointment_date = datetime.strptime(request.data['appointment_date'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    # Try alternate format if first one fails
                    appointment_date = datetime.strptime(request.data['appointment_date'], '%Y-%m-%dT%H:%M:%S')
                except ValueError:
                    return Response({"detail": "Invalid appointment date format. Expected format: YYYY-MM-DD HH:MM:SS"}, status=400)

            # Check if appointment date is in the past
            if appointment_date < datetime.now():
                return Response({"detail": "Cannot schedule appointments in the past"}, status=400)

            # Format time for database
            formatted_date = appointment_date.strftime('%Y-%m-%d %H:%M:%S')

            # Check if doctor is available
            if not doctor_data.get('is_available', True):
                return Response({"detail": "Doctor is not available for appointments"}, status=400)

            # Check for existing appointments at the same time
            query = """
                SELECT COUNT(*) as count 
                FROM api_appointment 
                WHERE doctor_id = %s 
                AND DATE(appointment_date) = DATE(%s)
                AND status != 'CANCELLED'
            """
            existing_appointments = execute_query(query, [request.data['doctor_id'], formatted_date])
            
            if existing_appointments[0]['count'] > 0:
                return Response({
                    "detail": "This doctor already has an appointment scheduled for this day. Please select a different day."
                }, status=400)

            # Insert appointment
            query = """
                INSERT INTO api_appointment (
                    patient_id, doctor_id,
                    appointment_date, symptoms, notes,
                    status, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, 'SCHEDULED', NOW(), NOW())
                RETURNING id
            """
            params = [
                patient_id,
                request.data['doctor_id'],
                formatted_date,
                request.data.get('symptoms', ''),
                request.data.get('notes', '')
            ]
            
            # Execute the insert and get the last inserted ID
            result = execute_query(query, params)
            last_id = result[0]['id'] if result else None

            if not last_id:
                return Response({"detail": "Failed to create appointment"}, status=500)

            # Get the created appointment with doctor and patient details
            query = """
                SELECT 
                    a.id, a.patient_id, a.doctor_id, 
                    a.appointment_date, a.symptoms, a.notes, 
                    a.status, a.created_at, a.updated_at,
                    CONCAT('Dr. ', u.first_name, ' ', u.last_name) as doctor_name,
                    CONCAT(pu.first_name, ' ', pu.last_name) as patient_name
                FROM api_appointment a
                JOIN api_doctor d ON a.doctor_id = d.id
                JOIN auth_user u ON d.user_id = u.id
                JOIN api_patient p ON a.patient_id = p.id
                JOIN auth_user pu ON p.user_id = pu.id
                WHERE a.id = %s
            """
            appointment = execute_query(query, [last_id])[0]
            
            return Response(appointment, status=201)

        except Exception as e:
            print("Error creating appointment:", str(e))
            return Response({"detail": str(e)}, status=400)

class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = """
            SELECT 
                a.id, a.patient_id, a.doctor_id,
                a.appointment_date, a.symptoms, a.notes,
                a.status, a.created_at, a.updated_at,
                CONCAT('Dr. ', du.first_name, ' ', du.last_name) as doctor_name,
                CONCAT(pu.first_name, ' ', pu.last_name) as patient_name
            FROM api_appointment a
            JOIN api_doctor d ON a.doctor_id = d.id
            JOIN api_patient p ON a.patient_id = p.id
            JOIN auth_user du ON d.user_id = du.id
            JOIN auth_user pu ON p.user_id = pu.id
            WHERE (p.user_id = %s OR d.user_id = %s)
            ORDER BY a.appointment_date DESC
        """
        appointments = execute_query(query, [self.request.user.id, self.request.user.id])
        
        # Format dates
        for appointment in appointments:
            if appointment['appointment_date']:
                appointment['appointment_date'] = appointment['appointment_date'].strftime('%Y-%m-%d %H:%M:%S')
            if appointment['created_at']:
                appointment['created_at'] = appointment['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if appointment['updated_at']:
                appointment['updated_at'] = appointment['updated_at'].strftime('%Y-%m-%d %H:%M:%S')
        
        return appointments

    def list(self, request, *args, **kwargs):
        try:
            appointments = self.get_queryset()
            return Response(appointments)
        except Exception as e:
            print("Error fetching appointments:", str(e))
            return Response({"error": str(e)}, status=500)

class ConsultancyViewSet(viewsets.ViewSet):
    def list(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT c.*, 
                           CONCAT(u1.first_name, ' ', u1.last_name) as patient_name,
                           CONCAT(u2.first_name, ' ', u2.last_name) as doctor_name
                    FROM api_consultancy c
                    JOIN api_patient p ON c.patient_id = p.id
                    JOIN api_doctor d ON c.doctor_id = d.id
                    JOIN auth_user u1 ON p.user_id = u1.id
                    JOIN auth_user u2 ON d.user_id = u2.id
                    WHERE p.user_id = %s
                    ORDER BY c.created_at DESC
                """, [request.user.id])
                
                columns = [col[0] for col in cursor.description]
                consultancies = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return Response(consultancies)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def create(self, request):
        try:
            # Get the patient profile for the authenticated user
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id FROM api_patient WHERE user_id = %s
                """, [request.user.id])
                result = cursor.fetchone()
                if not result:
                    return Response({'error': 'Patient profile not found'}, status=404)
                patient_id = result[0]

            # First create an appointment
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO api_appointment 
                    (patient_id, doctor_id, appointment_date, status, created_at, updated_at)
                    VALUES (%s, %s, %s, 'SCHEDULED', NOW(), NOW())
                """, [
                    patient_id,
                    request.data.get('doctor_id'),
                    request.data.get('follow_up_date')
                ])

                # Get the appointment ID
                cursor.execute("SELECT LAST_INSERT_ID()")
                appointment_id = cursor.fetchone()[0]

                # Now create the consultancy record with the appointment_id
                cursor.execute("""
                    INSERT INTO api_consultancy 
                    (patient_id, doctor_id, appointment_id, diagnosis, prescription, 
                    follow_up_date, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, [
                    patient_id,
                    request.data.get('doctor_id'),
                    appointment_id,
                    request.data.get('diagnosis', ''),
                    request.data.get('prescription', ''),
                    request.data.get('follow_up_date')
                ])

                # Get the ID of the inserted consultancy record
                cursor.execute("SELECT LAST_INSERT_ID()")
                consultancy_id = cursor.fetchone()[0]

                # Fetch the created consultancy record with all related information
                cursor.execute("""
                    SELECT c.*, 
                           CONCAT(u1.first_name, ' ', u1.last_name) as patient_name,
                           CONCAT(u2.first_name, ' ', u2.last_name) as doctor_name,
                           a.appointment_date, a.status as appointment_status
                    FROM api_consultancy c
                    JOIN api_patient p ON c.patient_id = p.id
                    JOIN api_doctor d ON c.doctor_id = d.id
                    JOIN auth_user u1 ON p.user_id = u1.id
                    JOIN auth_user u2 ON d.user_id = u2.id
                    JOIN api_appointment a ON c.appointment_id = a.id
                    WHERE c.id = %s
                """, [consultancy_id])
                
                columns = [col[0] for col in cursor.description]
                consultancy = dict(zip(columns, cursor.fetchone()))

            return Response({
                'message': 'Consultancy created successfully',
                'consultancy': consultancy
            }, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=400)

class EmergencyViewSet(viewsets.ModelViewSet):
    serializer_class = EmergencySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = """
            SELECT e.*, 
                   p.first_name as patient_first_name,
                   p.last_name as patient_last_name,
                   d.first_name as doctor_first_name,
                   d.last_name as doctor_last_name,
                   DATE_FORMAT(e.request_time, '%Y-%m-%d %H:%i:%s') as request_time,
                   DATE_FORMAT(e.arrival_time_in_hospital, '%Y-%m-%d %H:%i:%s') as arrival_time_in_hospital,
                   DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                   DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
            FROM Emergency e
            LEFT JOIN Patient p ON e.patient_id = p.id
            LEFT JOIN Doctor d ON e.doctor_id = d.id
            JOIN User u ON p.user_id = u.id
            WHERE u.id = %s
            ORDER BY e.request_time DESC
        """
        emergencies = execute_query(query, [self.request.user.id])
        
        # Format the response
        for emergency in emergencies:
            if emergency['patient_first_name'] and emergency['patient_last_name']:
                emergency['patient_name'] = f"{emergency['patient_first_name']} {emergency['patient_last_name']}"
            if emergency['doctor_first_name'] and emergency['doctor_last_name']:
                emergency['doctor_name'] = f"Dr. {emergency['doctor_first_name']} {emergency['doctor_last_name']}"
            
            # Remove the extra fields we added for the join
            del emergency['patient_first_name']
            del emergency['patient_last_name']
            del emergency['doctor_first_name']
            del emergency['doctor_last_name']
        
        return emergencies

    def create(self, request, *args, **kwargs):
        try:
            # Get patient ID from user ID
            query = """
                SELECT p.id FROM Patient p
                JOIN User u ON p.user_id = u.id
                WHERE u.id = %s
            """
            patient = execute_query(query, [request.user.id])
            
            if not patient:
                return Response({"error": "Patient profile not found"}, status=404)
            
            patient_id = patient[0]['id']

            # Insert emergency request
            query = """
                INSERT INTO Emergency (
                    patient_id, doctor_id,
                    ambulance_assign_status, ambulance_assigned,
                    status, arrival_time_in_hospital,
                    driver_name, driver_contact_num,
                    legal_issues_reported, legal_case_number
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            params = [
                patient_id,
                request.data.get('doctor_id'),
                request.data.get('ambulance_assign_status', 'No'),
                request.data.get('ambulance_assigned'),
                request.data.get('status', 'Pending'),
                request.data.get('arrival_time_in_hospital'),
                request.data.get('driver_name'),
                request.data.get('driver_contact_num'),
                request.data.get('legal_issues_reported', 'No'),
                request.data.get('legal_case_number')
            ]
            
            emergency_id = execute_query(query, params, fetch=False)

            # Get the created emergency request
            query = """
                SELECT e.*, 
                       p.first_name as patient_first_name,
                       p.last_name as patient_last_name,
                       d.first_name as doctor_first_name,
                       d.last_name as doctor_last_name,
                       DATE_FORMAT(e.request_time, '%Y-%m-%d %H:%i:%s') as request_time,
                       DATE_FORMAT(e.arrival_time_in_hospital, '%Y-%m-%d %H:%i:%s') as arrival_time_in_hospital,
                       DATE_FORMAT(e.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                       DATE_FORMAT(e.updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
                FROM Emergency e
                LEFT JOIN Patient p ON e.patient_id = p.id
                LEFT JOIN Doctor d ON e.doctor_id = d.id
                WHERE e.id = %s
            """
            emergency = execute_query(query, [emergency_id])[0]
            
            # Format the response
            if emergency['patient_first_name'] and emergency['patient_last_name']:
                emergency['patient_name'] = f"{emergency['patient_first_name']} {emergency['patient_last_name']}"
            if emergency['doctor_first_name'] and emergency['doctor_last_name']:
                emergency['doctor_name'] = f"Dr. {emergency['doctor_first_name']} {emergency['doctor_last_name']}"
            
            # Remove the extra fields we added for the join
            del emergency['patient_first_name']
            del emergency['patient_last_name']
            del emergency['doctor_first_name']
            del emergency['doctor_last_name']
            
            return Response(emergency, status=201)
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class AppointmentUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, appointment_id):
        try:
            # Start transaction
            execute_query("START TRANSACTION", [], fetch=False)

            # Check if appointment exists and user has permission to update it
            query = """
                SELECT a.*, d.user_id as doctor_user_id, p.user_id as patient_user_id
                FROM api_appointment a
                JOIN api_doctor d ON a.doctor_id = d.id
                JOIN api_patient p ON a.patient_id = p.id
                WHERE a.id = %s
            """
            appointment = execute_query(query, [appointment_id])
            
            if not appointment:
                return Response({"detail": "Appointment not found"}, status=404)
            
            appointment = appointment[0]
            
            # Check if user is either the doctor or patient of this appointment
            if request.user.id not in [appointment['doctor_user_id'], appointment['patient_user_id']]:
                return Response({"detail": "You don't have permission to update this appointment"}, status=403)

            # Update appointment
            query = """
                UPDATE api_appointment 
                SET status = %s,
                    symptoms = %s,
                    notes = %s,
                    appointment_date = %s,
                    updated_at = NOW()
                WHERE id = %s
            """
            params = [
                request.data.get('status', appointment['status']),
                request.data.get('symptoms', appointment['symptoms']),
                request.data.get('notes', appointment['notes']),
                request.data.get('appointment_date', appointment['appointment_date']),
                appointment_id
            ]
            execute_query(query, params, fetch=False)

            # Get updated appointment with doctor and patient details
            query = """
                SELECT 
                    a.id, a.patient_id, a.doctor_id, 
                    a.appointment_date, a.symptoms, a.notes, 
                    a.status, a.created_at, a.updated_at,
                    CONCAT('Dr. ', du.first_name, ' ', du.last_name) as doctor_name,
                    CONCAT(pu.first_name, ' ', pu.last_name) as patient_name
                FROM api_appointment a
                JOIN api_doctor d ON a.doctor_id = d.id
                JOIN auth_user du ON d.user_id = du.id
                JOIN api_patient p ON a.patient_id = p.id
                JOIN auth_user pu ON p.user_id = pu.id
                WHERE a.id = %s
            """
            updated_appointment = execute_query(query, [appointment_id])[0]

            # Commit transaction
            execute_query("COMMIT", [], fetch=False)

            return Response(updated_appointment)

        except Exception as e:
            # Rollback transaction on error
            execute_query("ROLLBACK", [], fetch=False)
            return Response({"error": str(e)}, status=400)