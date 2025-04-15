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
    doctor_id = serializers.IntegerField(required=False, allow_null=True)
    emergency_type = serializers.CharField(default='General', allow_blank=True)
    severity = serializers.CharField(default='Medium', allow_blank=True)
    symptoms = serializers.CharField(required=False, allow_blank=True)
    treatment_given = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(default='PENDING')
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    patient_name = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_unique_id = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_adhaar = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_type = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_phone = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_address = serializers.CharField(required=False, allow_blank=True)  # Added
    patient_emergency_contact = serializers.CharField(required=False, allow_blank=True)  # Added
    doctor_name = serializers.CharField(required=False, allow_blank=True)  # Added
    doctor_unique_id = serializers.CharField(required=False, allow_blank=True)  # Added
    doctor_specialization = serializers.CharField(required=False, allow_blank=True)  # Added
    doctor_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)  # Added
    doctor_experience = serializers.IntegerField(required=False, allow_null=True)  # Added

    def create(self, validated_data):
        from .models import execute_query
        query = """
            INSERT INTO api_emergency (
                patient_id, doctor_id, emergency_type, severity, symptoms,
                treatment_given, status, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        params = [
            validated_data['patient_id'],
            validated_data.get('doctor_id'),
            validated_data.get('emergency_type', 'General'),
            validated_data.get('severity', 'Medium'),
            validated_data.get('symptoms', ''),
            validated_data.get('treatment_given', ''),
            validated_data.get('status', 'PENDING')
        ]
        execute_query(query, params, fetch=False)
        query = "SELECT LAST_INSERT_ID() as id"
        result = execute_query(query)
        return {**validated_data, 'id': result[0]['id']}

    def update(self, instance, validated_data):
        from .models import execute_query
        update_fields = []
        params = []

        if 'doctor_id' in validated_data:
            update_fields.append("doctor_id = %s")
            params.append(validated_data.get('doctor_id'))
        if 'emergency_type' in validated_data:
            update_fields.append("emergency_type = %s")
            params.append(validated_data.get('emergency_type'))
        if 'severity' in validated_data:
            update_fields.append("severity = %s")
            params.append(validated_data.get('severity'))
        if 'symptoms' in validated_data:
            update_fields.append("symptoms = %s")
            params.append(validated_data.get('symptoms'))
        if 'treatment_given' in validated_data:
            update_fields.append("treatment_given = %s")
            params.append(validated_data.get('treatment_given'))
        if 'status' in validated_data:
            update_fields.append("status = %s")
            params.append(validated_data.get('status'))
        update_fields.append("updated_at = NOW()")
        params.append(instance['id'])

        query = f"""
            UPDATE api_emergency
            SET {', '.join(update_fields)}
            WHERE id = %s
        """
        execute_query(query, params, fetch=False)
        return {**instance, **validated_data}
    

class LabTestSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    test_name = serializers.CharField(required=True)
    lab_id = serializers.IntegerField(required=False)  
    patient_id = serializers.IntegerField(required=True)
    doctor_id = serializers.IntegerField(required=False)
    test_date = serializers.DateTimeField(required=True)
    result = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(default='Pending')  # e.g., 'Pending', 'Completed'
    cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        from .models import execute_query
        query = """
            INSERT INTO api_labtest (test_name, patient_id, doctor_id, test_date, test_description, result_status, test_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = [
            validated_data['test_name'],
            validated_data['patient_id'],
            validated_data.get('doctor_id'),
            validated_data['test_date'],
            validated_data.get('test_description', ''),
            validated_data.get('status', 'PENDING'),
            'Regular'  # Default test_type
        ]
        lab_test_id = execute_query(query, params, fetch=False)
        return {**validated_data, 'id': lab_test_id}

    def update(self, instance, validated_data):
        from .models import execute_query
        query = """
            UPDATE api_labtest
            SET test_name = %s,
                patient_id = %s,
                doctor_id = %s,
                test_date = %s,
                test_description = %s,
                result_status = %s,
                test_type = %s
            WHERE id = %s
        """
        params = [
            validated_data.get('test_name', instance.get('test_name')),
            validated_data.get('patient_id', instance.get('patient_id')),
            validated_data.get('doctor_id', instance.get('doctor_id')),
            validated_data.get('test_date', instance.get('test_date')),
            validated_data.get('test_description', instance.get('test_description', '')),
            validated_data.get('status', instance.get('result_status', 'PENDING')),
            validated_data.get('test_type', instance.get('test_type', 'Regular')),
            instance['id']
        ]
        execute_query(query, params, fetch=False)
        return {**instance, **validated_data}


class MedicalHistorySerializer(serializers.Serializer):
    history_id = serializers.IntegerField(read_only=True)
    patient_id = serializers.IntegerField()
    diagnosis = serializers.CharField(required=True)
    treatment = serializers.CharField(required=True)
    allergies = serializers.CharField(allow_blank=True, required=False, default='')
    past_surgeries = serializers.CharField(allow_blank=True, required=False, default='')
    previous_medications = serializers.CharField(allow_blank=True, required=False, default='')
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    def create(self, validated_data):
        from .models import execute_query
        
        # Start transaction
        execute_query("START TRANSACTION", [], fetch=False)
        
        try:
            # Insert the record
            insert_query = """
                INSERT INTO api_medicalhistory 
                (patient_id, diagnosis, treatment, allergies, past_surgeries, 
                previous_medications)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = [
                validated_data['patient_id'],
                validated_data['diagnosis'],
                validated_data['treatment'],
                validated_data.get('allergies', ''),
                validated_data.get('past_surgeries', ''),
                validated_data.get('previous_medications', '')
            ]
            execute_query(insert_query, params, fetch=False)
            
            # Get the ID of the newly inserted record
            id_query = "SELECT LAST_INSERT_ID() as id"
            result = execute_query(id_query, [])
            new_id = result[0]['id']
            
            # Fetch the complete record
            fetch_query = """
                SELECT 
                    history_id,
                    patient_id,
                    diagnosis,
                    treatment,
                    COALESCE(allergies, '') as allergies,
                    COALESCE(past_surgeries, '') as past_surgeries,
                    COALESCE(previous_medications, '') as previous_medications
                FROM api_medicalhistory 
                WHERE history_id = %s
            """
            new_record = execute_query(fetch_query, [new_id])
            
            # Commit the transaction
            execute_query("COMMIT", [], fetch=False)
            
            return new_record[0]
            
        except Exception as e:
            # Rollback in case of error
            execute_query("ROLLBACK", [], fetch=False)
            raise e

    def update(self, instance, validated_data):
        from .models import execute_query
        
        # Start transaction
        execute_query("START TRANSACTION", [], fetch=False)
        
        try:
            update_query = """
                UPDATE api_medicalhistory
                SET diagnosis = %s,
                    treatment = %s,
                    allergies = %s,
                    past_surgeries = %s,
                    previous_medications = %s
                WHERE history_id = %s
            """
            params = [
                validated_data.get('diagnosis', instance['diagnosis']),
                validated_data.get('treatment', instance['treatment']),
                validated_data.get('allergies', instance.get('allergies', '')),
                validated_data.get('past_surgeries', instance.get('past_surgeries', '')),
                validated_data.get('previous_medications', instance.get('previous_medications', '')),
                instance['history_id']
            ]
            execute_query(update_query, params, fetch=False)
            
            # Fetch the updated record
            fetch_query = """
                SELECT 
                    history_id,
                    patient_id,
                    diagnosis,
                    treatment,
                    COALESCE(allergies, '') as allergies,
                    COALESCE(past_surgeries, '') as past_surgeries,
                    COALESCE(previous_medications, '') as previous_medications
                FROM api_medicalhistory 
                WHERE history_id = %s
            """
            updated_record = execute_query(fetch_query, [instance['history_id']])
            
            # Commit the transaction
            execute_query("COMMIT", [], fetch=False)
            
            return updated_record[0]
            
        except Exception as e:
            # Rollback in case of error
            execute_query("ROLLBACK", [], fetch=False)
            raise e
