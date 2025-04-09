from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

import json
import firebase_admin
from firebase_admin import auth as firebase_auth
from krishiconnect.firebase_config import get_firestore_db, get_firebase_auth, verify_firebase_token
from .serializers import (
    BuyerProfileSerializer,
    EmailLoginSerializer,
    EmailSignupSerializer
)

# Web Views
def buyer_login_view(request):
    """Render the buyer login page"""
    context = {
        'firebase_config': {
            'apiKey': settings.FIREBASE_API_KEY,
            'authDomain': settings.FIREBASE_AUTH_DOMAIN,
            'projectId': settings.FIREBASE_PROJECT_ID,
            'storageBucket': settings.FIREBASE_STORAGE_BUCKET,
            'messagingSenderId': settings.FIREBASE_MESSAGING_SENDER_ID,
            'appId': settings.FIREBASE_APP_ID,
        }
    }
    return render(request, 'buyers/login.html', context)

def buyer_register_view(request):
    """Render the buyer registration page"""
    context = {
        'firebase_config': {
            'apiKey': settings.FIREBASE_API_KEY,
            'authDomain': settings.FIREBASE_AUTH_DOMAIN,
            'projectId': settings.FIREBASE_PROJECT_ID,
            'storageBucket': settings.FIREBASE_STORAGE_BUCKET,
            'messagingSenderId': settings.FIREBASE_MESSAGING_SENDER_ID,
            'appId': settings.FIREBASE_APP_ID,
        }
    }
    return render(request, 'buyers/register.html', context)

def buyer_dashboard_view(request):
    """Render the buyer dashboard page"""
    # This view should check for authentication
    return render(request, 'buyers/dashboard.html')

def browse_products_view(request):
    """Render the product browsing page"""
    context = {
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY
    }
    return render(request, 'buyers/browse_products.html', context)

# API Endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def login_buyer(request):
    """Login buyer with email/password"""
    serializer = EmailLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real implementation, Firebase Auth would handle this
    # For now, we'll return a mock success response
    return Response({
        'success': True,
        'message': 'Login successful',
        'token': 'mock-id-token'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_buyer(request):
    """Sign up a new buyer with email/password"""
    serializer = EmailSignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # In a real implementation, Firebase Auth would handle this
    # For now, we'll return a mock success response
    return Response({
        'success': True,
        'message': 'Account created successfully',
        'token': 'mock-id-token'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_buyer(request):
    """Register a new buyer after authentication"""
    # Extract the Firebase ID token from the request
    id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not id_token:
        return Response(
            {'error': 'No authorization token provided'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify the token
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return Response(
            {'error': 'Invalid token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Validate the buyer data
    serializer = BuyerProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get user details from the token
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        # Prepare buyer data
        buyer_data = {
            'uid': uid,
            'email': email or serializer.validated_data['email'],
            'full_name': serializer.validated_data['full_name'],
            'phone_number': serializer.validated_data['phone_number'],
            'company_name': serializer.validated_data.get('company_name', ''),
            'address': {
                'street': serializer.validated_data['street'],
                'city': serializer.validated_data['city'],
                'district': serializer.validated_data['district'],
                'state': serializer.validated_data['state'],
            },
            'location': {
                'latitude': serializer.validated_data.get('latitude', 0),
                'longitude': serializer.validated_data.get('longitude', 0),
            },
            'profile_image_url': serializer.validated_data.get('profile_image_url', ''),
            'created_at': firebase_admin.firestore.SERVER_TIMESTAMP,
            'is_verified': False,  # Will be verified later if needed
            'buyer_type': serializer.validated_data.get('buyer_type', 'Individual'),
            'role': 'buyer'
        }
        
        # Save to Firestore
        db = get_firestore_db()
        db.collection('buyers').document(uid).set(buyer_data)
        
        # Set custom claims for role-based access
        firebase_auth.set_custom_user_claims(uid, {'role': 'buyer'})
        
        return Response({
            'success': True,
            'message': 'Buyer registered successfully',
            'uid': uid
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def buyer_profile(request):
    """Get the buyer's profile"""
    # Extract the Firebase ID token from the request
    id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not id_token:
        return Response(
            {'error': 'No authorization token provided'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify the token
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return Response(
            {'error': 'Invalid token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        uid = decoded_token['uid']
        
        # Get buyer data from Firestore
        db = get_firestore_db()
        buyer_doc = db.collection('buyers').document(uid).get()
        
        if not buyer_doc.exists:
            return Response({
                'error': 'Buyer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        buyer_data = buyer_doc.to_dict()
        
        return Response(buyer_data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_buyer_profile(request):
    """Update buyer profile"""
    # Extract the Firebase ID token from the request
    id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not id_token:
        return Response(
            {'error': 'No authorization token provided'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verify the token
    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        return Response(
            {'error': 'Invalid token'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Partial update allowed
    serializer = BuyerProfileSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        uid = decoded_token['uid']
        
        # Get fields to update
        update_data = {}
        
        # Map serializer fields to Firestore fields
        field_mapping = {
            'full_name': 'full_name',
            'phone_number': 'phone_number',
            'company_name': 'company_name',
            'street': 'address.street',
            'city': 'address.city',
            'district': 'address.district',
            'state': 'address.state',
            'latitude': 'location.latitude',
            'longitude': 'location.longitude',
            'profile_image_url': 'profile_image_url',
            'buyer_type': 'buyer_type'
        }
        
        for field, firestore_field in field_mapping.items():
            if field in serializer.validated_data:
                update_data[firestore_field] = serializer.validated_data[field]
        
        # Update in Firestore
        db = get_firestore_db()
        buyer_ref = db.collection('buyers').document(uid)
        buyer_ref.update(update_data)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout_buyer(request):
    """Logout buyer"""
    # Firebase handles token invalidation on client side
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })
