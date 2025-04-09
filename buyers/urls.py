from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_buyer, name='login_buyer'),
    path('signup/', views.signup_buyer, name='signup_buyer'),
    path('logout/', views.logout_buyer, name='logout_buyer'),
    
    # Profile endpoints
    path('register/', views.register_buyer, name='register_buyer'),
    path('profile/', views.buyer_profile, name='buyer_profile'),
    path('profile/update/', views.update_buyer_profile, name='update_buyer_profile'),
    
    # Web views
    path('login-view/', views.buyer_login_view, name='buyer_login_view'),
    path('register-view/', views.buyer_register_view, name='buyer_register_view'),
    path('dashboard/', views.buyer_dashboard_view, name='buyer_dashboard_view'),
    path('browse-products/', views.browse_products_view, name='browse_products_view'),
]
