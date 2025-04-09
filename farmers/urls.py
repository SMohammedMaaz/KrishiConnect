from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('logout/', views.logout, name='farmer_logout'),
    
    # Profile endpoints
    path('register/', views.register_farmer, name='register_farmer'),
    path('profile/', views.farmer_profile, name='farmer_profile'),
    path('profile/update/', views.update_farmer_profile, name='update_farmer_profile'),
    
    # Aadhar verification
    path('verify-aadhar/', views.verify_aadhar, name='verify_aadhar'),
    
    # Web views
    path('login/', views.farmer_login_view, name='farmer_login_view'),
    path('register-view/', views.farmer_register_view, name='farmer_register_view'),
    path('dashboard/', views.farmer_dashboard_view, name='farmer_dashboard_view'),
]
