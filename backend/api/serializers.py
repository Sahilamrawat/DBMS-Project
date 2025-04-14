from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password

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

        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add user details to the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'user_type': self.user.user_type
        }
        
        return data

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user

class NoteSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(required=True)
    content = serializers.CharField(required=True)
    user_id = serializers.IntegerField(required=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        from .models import execute_query
        query = """
            INSERT INTO Note (title, content, user_id)
            VALUES (%s, %s, %s)
        """
        params = [
            validated_data['title'],
            validated_data['content'],
            validated_data['user_id']
        ]
        note_id = execute_query(query, params, fetch=False)
        return {**validated_data, 'id': note_id}

    def update(self, instance, validated_data):
        from .models import execute_query
        query = """
            UPDATE Note 
            SET title = %s,
                content = %s
            WHERE id = %s
        """
        params = [
            validated_data.get('title', instance.get('title')),
            validated_data.get('content', instance.get('content')),
            instance['id']
        ]
        execute_query(query, params, fetch=False)
        return {**instance, **validated_data}

class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    profile_picture = serializers.ImageField(required=False)
    address = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.CharField(required=False)
    blood_group = serializers.CharField(required=False)

    def create(self, validated_data):
        from .models import execute_query
        query = """
            INSERT INTO Profile (user_id, profile_picture, address, phone, date_of_birth, gender, blood_group)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = [
            validated_data['user_id'],
            validated_data.get('profile_picture'),
            validated_data.get('address'),
            validated_data.get('phone'),
            validated_data.get('date_of_birth'),
            validated_data.get('gender'),
            validated_data.get('blood_group')
        ]
        profile_id = execute_query(query, params, fetch=False)
        return {**validated_data, 'id': profile_id}

    def update(self, instance, validated_data):
        from .models import execute_query
        query = """
            UPDATE Profile 
            SET profile_picture = %s,
                address = %s,
                phone = %s,
                date_of_birth = %s,
                gender = %s,
                blood_group = %s
            WHERE id = %s
        """
        params = [
            validated_data.get('profile_picture', instance.get('profile_picture')),
            validated_data.get('address', instance.get('address')),
            validated_data.get('phone', instance.get('phone')),
            validated_data.get('date_of_birth', instance.get('date_of_birth')),
            validated_data.get('gender', instance.get('gender')),
            validated_data.get('blood_group', instance.get('blood_group')),
            instance['id']
        ]
        execute_query(query, params, fetch=False)
        return {**instance, **validated_data}

class DoctorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    doctor_id = serializers.CharField()
    specialization = serializers.CharField()
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2)
    qualifications = serializers.CharField()
    experience_years = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

class AppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    appointment_id = serializers.CharField(read_only=True)
    patient_id = serializers.IntegerField(required=True)
    doctor_id = serializers.IntegerField(required=True)
    patient_id_display = serializers.CharField(required=False)
    doctor_id_display = serializers.CharField(required=False)
    appointment_date = serializers.DateTimeField(required=True)
    appointment_mode = serializers.CharField(default='IN_PERSON')
    appointment_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    symptoms = serializers.CharField(required=False)
    notes = serializers.CharField(required=False)

class ConsultancySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField()
    symptoms = serializers.CharField(required=False, allow_blank=True)
    diagnosis = serializers.CharField(required=False, allow_blank=True)
    prescription = serializers.CharField(required=False, allow_blank=True)
    follow_up_date = serializers.DateTimeField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class EmergencySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    patient_id = serializers.IntegerField(required=True)
    doctor_id = serializers.IntegerField(required=False)
    request_time = serializers.DateTimeField(read_only=True)
    ambulance_assign_status = serializers.CharField(default='No')
    ambulance_assigned = serializers.CharField(required=False)
    status = serializers.CharField(default='Pending')
    arrival_time_in_hospital = serializers.DateTimeField(required=False)
    driver_name = serializers.CharField(required=False)
    driver_contact_num = serializers.CharField(required=False)
    legal_issues_reported = serializers.CharField(default='No')
    legal_case_number = serializers.CharField(required=False)