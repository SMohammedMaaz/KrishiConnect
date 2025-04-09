from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
import sys
import os

# Import the health check view
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from health_check import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('health/', health_check, name='health_check'),
    path('api/farmers/', include('farmers.urls')),
    path('api/buyers/', include('buyers.urls')),
    path('api/products/', include('products.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
