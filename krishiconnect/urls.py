from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('about/', TemplateView.as_view(template_name='about.html'), name='about'),
    path('contact/', TemplateView.as_view(template_name='contact.html'), name='contact'),
    path('market-trends/', TemplateView.as_view(template_name='market_trends.html'), name='market_trends'),
    path('farming-guide/', TemplateView.as_view(template_name='farming_guide.html'), name='farming_guide'),
    path('privacy-policy/', TemplateView.as_view(template_name='privacy_policy.html'), name='privacy_policy'),
    path('terms-conditions/', TemplateView.as_view(template_name='terms_conditions.html'), name='terms_conditions'),
    path('api/farmers/', include('farmers.urls')),
    path('api/buyers/', include('buyers.urls')),
    path('api/products/', include('products.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
