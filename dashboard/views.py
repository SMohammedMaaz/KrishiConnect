from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

import firebase_admin
from firebase_admin import auth as firebase_auth
from krishiconnect.firebase_config import get_firestore_db, verify_firebase_token

def admin_dashboard_view(request):
    """Render the admin dashboard page"""
    return render(request, 'dashboard/admin_dashboard.html')

@api_view(['GET'])
@permission_classes([AllowAny])
def get_basic_stats(request):
    """Get basic statistics for the platform"""
    try:
        db = get_firestore_db()
        
        # Count farmers
        farmers_count = count_collection(db, 'farmers')
        
        # Count buyers
        buyers_count = count_collection(db, 'buyers')
        
        # Count products
        products_query = db.collection('products').where('is_available', '==', True)
        products_count = len(list(products_query.stream()))
        
        # Count total products (including unavailable)
        total_products_count = count_collection(db, 'products')
        
        # Top categories (dummy data for now - would need aggregation queries)
        top_categories = [
            {'name': 'Grains', 'count': 120},
            {'name': 'Vegetables', 'count': 85},
            {'name': 'Fruits', 'count': 70},
            {'name': 'Pulses', 'count': 45},
            {'name': 'Spices', 'count': 30}
        ]
        
        # Return all statistics
        return Response({
            'farmers_count': farmers_count,
            'buyers_count': buyers_count,
            'products_count': products_count,
            'total_products_count': total_products_count,
            'top_categories': top_categories
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def count_collection(db, collection_name):
    """Count documents in a Firestore collection (helper function)"""
    # Note: This is not efficient for very large collections
    # For production, use Firebase's count functionality or Cloud Functions
    query = db.collection(collection_name)
    return len(list(query.stream()))
