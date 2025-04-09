from django.urls import path
from . import views

urlpatterns = [
    # Product CRUD endpoints
    path('create/', views.create_product, name='create_product'),
    path('list/', views.list_products, name='list_products'),
    path('farmer/<str:farmer_id>/', views.get_farmer_products, name='get_farmer_products'),
    path('<str:product_id>/', views.get_product, name='get_product'),
    path('<str:product_id>/update/', views.update_product, name='update_product'),
    path('<str:product_id>/delete/', views.delete_product, name='delete_product'),
    
    # Product search
    path('search/', views.search_products, name='search_products'),
    
    # Suggestion API (placeholder for AI suggestions)
    path('suggestions/', views.get_crop_suggestions, name='get_crop_suggestions'),
]
