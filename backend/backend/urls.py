from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, CustomTokenObtainPairView,ProfileDetailView, DoctorListView, AppointmentListView, AppointmentCreateView ,  ConsultancyViewSet
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
    path('api/', include('api.urls')),

        # Custom Consultancy paths
    path('api/consultancies/', consultancy_list, name='consultancy-list'),
    path('api/consultancies/<int:pk>/', consultancy_detail, name='consultancy-detail'),

]
