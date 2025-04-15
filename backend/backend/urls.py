from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CustomTokenObtainPairView,ProfileDetailView, DoctorListView, AppointmentListView, AppointmentCreateView ,  ConsultancyViewSet , EmergencyViewSet ,AssignLabTestView, DoctorLabTestListView, PatientLabTestListView,PatientLabTestRequestView,EmergencyPatientListView , MedicalHistoryView, AllMedicalHistoryView,ChronicDiseasePatientsView,SurgeryHistoryPatientsView,DoctorMedicalHistoryView,FeedbackView, FeedbackDetailView , MedicineView, PharmacyView, MedicineStockView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


consultancy_list = ConsultancyViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
consultancy_detail = ConsultancyViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# ✅ Emergency ViewSet mapping
emergency_list = EmergencyViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
emergency_detail = EmergencyViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/',CreateUserView.as_view(), name='register'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='get_token'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='refresh_token'),
    path('api-auth/', include('rest_framework.urls')),  # For login/logout
    path('api/', include('api.urls')),
    path('api/profile/',ProfileDetailView.as_view(), name='profile-detail'), 
    path('api/doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('api/appointments/', AppointmentListView.as_view(), name='appointment-list'),
    path('api/appointments/create/', AppointmentCreateView.as_view(), name='appointment-create'),
    # Custom Consultancy paths
    path('api/consultancies/', consultancy_list, name='consultancy-list'),
    path('api/consultancies/<int:pk>/', consultancy_detail, name='consultancy-detail'),

    # ✅ Emergency paths
    path('api/emergencies/', emergency_list, name='emergency-list'),
    path('api/emergencies/<int:pk>/', emergency_detail, name='emergency-detail'),

     #labtest paths 
    # Doctor routes
    path('api/doctor/assign-labtest/', AssignLabTestView.as_view(), name='assign_labtest'),
    path('api/doctor/labtests/', DoctorLabTestListView.as_view(), name='doctor_labtests'),
    path('api/doctor/labtests/<int:labtest_id>/', DoctorLabTestListView.as_view(), name='update_labtest'),

    # Patient routes
    path('api/patient/labtests/', PatientLabTestListView.as_view(), name='patient_labtests'),
    path('api/patient/request-labtest/', PatientLabTestRequestView.as_view(), name='request_labtest'),

    #medical history 
    path('api/medical-history/', MedicalHistoryView.as_view(), name='medical_history'),
    path('api/medical-history/<int:pk>/', MedicalHistoryView.as_view(), name='medical-history-update'),
    path('api/medical-history/all/', AllMedicalHistoryView.as_view(), name='all_medical_history'),
    path('api/medical-history/chronic/', ChronicDiseasePatientsView.as_view(), name='chronic_disease_patients'),
    path('api/medical-history/surgeries/', SurgeryHistoryPatientsView.as_view(), name='surgery_history_patients'),
    path('api/medical-history/doctor/', DoctorMedicalHistoryView.as_view(), name='doctor_medical_history'),

    # Feedback routes
    path('feedback/', FeedbackView.as_view(), name='feedback'),
    path('feedback/<int:feedback_id>/', FeedbackView.as_view(), name='feedback-detail'),
    path('feedback-detail/', FeedbackDetailView.as_view(), name='feedback-detail-view'),


    #medicine routes 
    path('medicine/', MedicineView.as_view(), name='medicine'),
    path('medicine/<int:pk>/', MedicineView.as_view(), name='medicine-detail'),
    path('pharmacy/', PharmacyView.as_view(), name='pharmacy'),
    
    # New endpoint for stock info and expiring soon 
    path('medicine/stock-info/', MedicineStockView.as_view(), name='medicine-stock-info'),


]

