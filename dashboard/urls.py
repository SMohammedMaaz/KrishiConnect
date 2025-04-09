from django.urls import path
from . import views

urlpatterns = [
    # Dashboard data endpoints
    path('stats/', views.get_basic_stats, name='get_basic_stats'),
    
    # Admin dashboard view
    path('admin/', views.admin_dashboard_view, name='admin_dashboard_view'),
]
