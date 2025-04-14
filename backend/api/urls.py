from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import AppointmentUpdateView

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'consultancy', views.ConsultancyViewSet, basename='consultancy')
router.register(r'emergency', views.EmergencyViewSet, basename='emergency')

urlpatterns = [
    path('', include(router.urls)),
    path('notes/', views.NoteListCreate.as_view(), name='note-list-create'),
    path('notes/delete/<int:pk>/', views.NoteDelete.as_view(), name='note-delete'),
    path('user/register/', views.CreateUserView.as_view(), name='user-register'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', views.ProfileDetailView.as_view(), name='profile-detail'),
    path('doctors/', views.DoctorListView.as_view(), name='doctor-list'),
    path('appointments/create/', views.AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/', views.AppointmentListView.as_view(), name='appointment-list'),
    path('appointments/<int:appointment_id>/update/', AppointmentUpdateView.as_view(), name='appointment-update'),
]