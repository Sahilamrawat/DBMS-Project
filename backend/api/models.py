from django.db import connection
import json
from datetime import datetime
from django.utils import timezone

def execute_query(query, params=None, fetch=True):
    """Execute a SQL query and return results if fetch is True"""
    with connection.cursor() as cursor:
        try:
            cursor.execute(query, params or ())
            if fetch:
                columns = [col[0] for col in cursor.description]
                results = [
                    dict(zip(columns, row))
                    for row in cursor.fetchall()
                ]
                return results
            else:
                return cursor.lastrowid
        except Exception as e:
            raise e

# Table creation queries
CREATE_TABLES = {
    'User': """
        CREATE TABLE IF NOT EXISTS User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(150) UNIQUE NOT NULL,
            email VARCHAR(254) UNIQUE NOT NULL,
            password VARCHAR(128) NOT NULL,
            first_name VARCHAR(30),
            last_name VARCHAR(150),
            is_staff BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            date_joined DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """,
    'Note': """
        CREATE TABLE IF NOT EXISTS Note (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            user_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
        )
    """,
    'Profile': """
        CREATE TABLE IF NOT EXISTS Profile (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            profile_picture VARCHAR(100),
            address TEXT,
            phone VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(10),
            blood_group VARCHAR(5),
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
        )
    """,
    'Doctor': """
        CREATE TABLE IF NOT EXISTS Doctor (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            specialization VARCHAR(100),
            qualification TEXT,
            experience INT,
            consultation_fee DECIMAL(10,2),
            schedule JSON,
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
        )
    """,
    'Patient': """
        CREATE TABLE IF NOT EXISTS Patient (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(254),
            address TEXT,
            phone VARCHAR(20),
            patient_type VARCHAR(50),
            FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
        )
    """,
    'Appointment': """
        CREATE TABLE IF NOT EXISTS Appointment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            appointment_id VARCHAR(20) UNIQUE NOT NULL,
            patient_id INT NOT NULL,
            doctor_id INT NOT NULL,
            patient_id_display VARCHAR(100),
            doctor_id_display VARCHAR(100),
            appointment_date DATETIME NOT NULL,
            appointment_mode VARCHAR(20) DEFAULT 'IN_PERSON',
            appointment_fee DECIMAL(10,2),
            symptoms TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES Patient(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES Doctor(id) ON DELETE CASCADE
        )
    """,
    'Consultancy': """
        CREATE TABLE IF NOT EXISTS Consultancy (
            consult_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            doctor_id INT NOT NULL,
            consultation_type VARCHAR(50),
            appointment_date DATE,
            appointment_time TIME,
            diagnosis TEXT,
            treatment TEXT,
            allergies TEXT,
            past_surgeries TEXT,
            previous_medications TEXT,
            consultation_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES Patient(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES Doctor(id) ON DELETE CASCADE
        )
    """,
    'Emergency': """
        CREATE TABLE IF NOT EXISTS Emergency (
            id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT NOT NULL,
            doctor_id INT,
            request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            ambulance_assign_status VARCHAR(20) DEFAULT 'No',
            ambulance_assigned VARCHAR(100),
            status VARCHAR(50) DEFAULT 'Pending',
            arrival_time_in_hospital DATETIME,
            driver_name VARCHAR(100),
            driver_contact_num VARCHAR(20),
            legal_issues_reported VARCHAR(20) DEFAULT 'No',
            legal_case_number VARCHAR(100),
            FOREIGN KEY (patient_id) REFERENCES Patient(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES Doctor(id) ON DELETE SET NULL
        )
    """
}

def drop_all_tables():
    """Drop all tables in the correct order to handle foreign key constraints"""
    try:
        # Drop tables in reverse order of dependencies
        tables = [
            'api_note',
            'api_emergency',
            'api_consultancy',
            'api_appointment',
            'api_doctor',
            'api_patient',
            'api_profile'
        ]
        
        for table in tables:
            execute_query(f"DROP TABLE IF EXISTS {table}", [], fetch=False)
        
        print("All custom tables dropped successfully")
        return True
    except Exception as e:
        print(f"Error dropping tables: {str(e)}")
        return False

def initialize_database():
    """Initialize the database with required tables"""
    try:
        # Create User table
        execute_query("""
            CREATE TABLE IF NOT EXISTS auth_user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(128) NOT NULL,
                email VARCHAR(254) UNIQUE NOT NULL,
                first_name VARCHAR(30),
                last_name VARCHAR(150),
                is_active BOOLEAN DEFAULT TRUE,
                is_staff BOOLEAN DEFAULT FALSE,
                is_superuser BOOLEAN DEFAULT FALSE,
                date_joined DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        """, [], fetch=False)

        # Create Profile table with all necessary fields
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_profile (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                phone VARCHAR(15),
                address TEXT,
                date_of_birth DATE,
                gender VARCHAR(10),
                blood_group VARCHAR(5),
                height DECIMAL(5,2),
                weight DECIMAL(5,2),
                emergency_contact VARCHAR(15),
                insurance_status VARCHAR(20),
                insurance_number VARCHAR(50),
                allergies TEXT,
                medical_conditions TEXT,
                user_type VARCHAR(20) DEFAULT 'PATIENT',
                profile_picture VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        # Create Patient table with all necessary fields
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_patient (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                patient_id VARCHAR(20) UNIQUE NOT NULL,
                adhaar_number VARCHAR(12) UNIQUE,
                patient_type VARCHAR(20) DEFAULT 'outpatient',
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_visit_date DATETIME,
                next_appointment_date DATETIME,
                medical_history TEXT,
                current_medications TEXT,
                family_history TEXT,
                lifestyle_factors TEXT,
                vaccination_history TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        # Create Doctor table with all necessary fields
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_doctor (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                doctor_id VARCHAR(20) UNIQUE NOT NULL,
                specialization VARCHAR(50),
                consultation_fee DECIMAL(10,2),
                experience_years INT,
                qualifications TEXT,
                available_days TEXT,
                available_hours TEXT,
                is_available BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        # Create Appointment table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_appointment (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                appointment_date DATETIME NOT NULL,
                appointment_time TIME NOT NULL,
                status VARCHAR(20) DEFAULT 'PENDING',
                symptoms TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES api_patient(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES api_doctor(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        # Create Consultancy table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_consultancy (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                appointment_id INT NOT NULL,
                diagnosis TEXT,
                prescription TEXT,
                follow_up_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES api_patient(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES api_doctor(id) ON DELETE CASCADE,
                FOREIGN KEY (appointment_id) REFERENCES api_appointment(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        # Create Emergency table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_emergency (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT NULL,
                emergency_type VARCHAR(50),
                severity VARCHAR(20),
                symptoms TEXT,
                treatment_given TEXT,
                status VARCHAR(20) DEFAULT 'PENDING',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES api_patient(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES api_doctor(id) ON DELETE SET NULL
            )
        """, [], fetch=False)

        # Create Note table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_note (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(100),
                content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
            )
        """, [], fetch=False)

        
                # Create LabTest table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_labtest (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT NOT NULL,
                doctor_id INT,
                test_type VARCHAR(100) NOT NULL,
                test_name VARCHAR(100),
                test_description TEXT,
                test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                result_status VARCHAR(20) DEFAULT 'PENDING',
                result_file VARCHAR(255),
                lab_technician_name VARCHAR(100),
                lab_technician_contact VARCHAR(20),
                remarks TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES api_patient(id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES api_doctor(id) ON DELETE SET NULL
            )
        """, [], fetch=False)

        # Create api_medicalhistory table
        execute_query("""
            CREATE TABLE IF NOT EXISTS api_medicalhistory (
                history_id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT UNIQUE, -- One-to-one relation with api_profile
                diagnosis VARCHAR(255) NOT NULL,
                treatment VARCHAR(255) NOT NULL,
                allergies VARCHAR(255),
                past_surgeries VARCHAR(255),
                previous_medications VARCHAR(255),
                FOREIGN KEY (patient_id) REFERENCES api_profile(id) ON DELETE CASCADE
            )
        """, [], fetch=False)


        print("Database initialized successfully!")
        print("Created tables:")
        print("- User table")
        print("- Profile table")
        print("- Patient table")
        print("- Doctor table")
        print("- Appointment table")
        print("- Consultancy table")
        print("- Emergency table")
        print("- Note table")
        print("_ Lab Test ")
        print("_ api_medicalhistory")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

  