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
    FarmerProfileSerializer, 
    AadharVerificationSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer
)

# Web Views
def farmer_login_view(request):
    """Render the farmer login page"""
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
    return render(request, 'farmers/login.html', context)

def farmer_register_view(request):
    """Render the farmer registration page"""
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
    return render(request, 'farmers/register.html', context)

def farmer_dashboard_view(request):
    """Render the farmer dashboard page"""
    # This view should check for authentication
    return render(request, 'farmers/dashboard.html')

# API Endpoints
@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to farmer's phone number"""
    serializer = SendOTPSerializer(data=request.data)
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        
        # In a real implementation, integrate with Firebase Auth Phone verification
        # For now, return a mock response
        return Response({
            'success': True,
            'message': 'OTP sent successfully',
            'verification_id': 'mock-verification-id'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and create/authenticate user"""
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        # In a real implementation, verify with Firebase Auth
        # For now, return a mock token
        
        # Check if this farmer exists in Firestore
        db = get_firestore_db()
        farmers_ref = db.collection('farmers')
        
        # Query by phone number
        query = farmers_ref.where('phone_number', '==', serializer.validated_data['phone_number']).limit(1)
        farmer_exists = len(list(query.stream())) > 0
        
        return Response({
            'success': True,
            'token': 'mock-id-token',
            'is_registered': farmer_exists,
            'message': 'OTP verified successfully'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_farmer(request):
    """Register a new farmer after phone verification"""
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
    
    # Validate the farmer data
    serializer = FarmerProfileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get user details from the token
        uid = decoded_token['uid']
        phone_number = decoded_token.get('phone_number', '')
        
        # Prepare farmer data
        farmer_data = {
            'uid': uid,
            'phone_number': phone_number or serializer.validated_data['phone_number'],
            'full_name': serializer.validated_data['full_name'],
            'aadhar_number': serializer.validated_data['aadhar_number'],
            'address': {
                'village': serializer.validated_data['village'],
                'district': serializer.validated_data['district'],
                'state': serializer.validated_data['state'],
            },
            'location': {
                'latitude': serializer.validated_data.get('latitude', 0),
                'longitude': serializer.validated_data.get('longitude', 0),
            },
            'profile_image_url': serializer.validated_data.get('profile_image_url', ''),
            'created_at': firebase_admin.firestore.SERVER_TIMESTAMP,
            'is_verified': False,  # Aadhar verification pending
            'role': 'farmer'
        }
        
        # Save to Firestore
        db = get_firestore_db()
        db.collection('farmers').document(uid).set(farmer_data)
        
        # Set custom claims for role-based access
        firebase_auth.set_custom_user_claims(uid, {'role': 'farmer'})
        
        # Create Aadhar verification record
        db.collection('aadhar_verifications').document(uid).set({
            'uid': uid,
            'aadhar_number': serializer.validated_data['aadhar_number'],
            'verification_status': 'pending',
            'created_at': firebase_admin.firestore.SERVER_TIMESTAMP
        })
        
        return Response({
            'success': True,
            'message': 'Farmer registered successfully',
            'uid': uid
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def farmer_profile(request):
    """Get the farmer's profile"""
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
        
        # Get farmer data from Firestore
        db = get_firestore_db()
        farmer_doc = db.collection('farmers').document(uid).get()
        
        if not farmer_doc.exists:
            return Response({
                'error': 'Farmer profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        farmer_data = farmer_doc.to_dict()
        
        # Remove sensitive information
        if 'aadhar_number' in farmer_data:
            farmer_data['aadhar_number'] = 'XXXX-XXXX-' + farmer_data['aadhar_number'][-4:]
        
        return Response(farmer_data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_farmer_profile(request):
    """Update farmer profile"""
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
    serializer = FarmerProfileSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        uid = decoded_token['uid']
        
        # Get fields to update
        update_data = {}
        
        if 'full_name' in serializer.validated_data:
            update_data['full_name'] = serializer.validated_data['full_name']
        
        if 'village' in serializer.validated_data:
            update_data['address.village'] = serializer.validated_data['village']
        
        if 'district' in serializer.validated_data:
            update_data['address.district'] = serializer.validated_data['district']
            
        if 'state' in serializer.validated_data:
            update_data['address.state'] = serializer.validated_data['state']
            
        if 'latitude' in serializer.validated_data:
            update_data['location.latitude'] = serializer.validated_data['latitude']
            
        if 'longitude' in serializer.validated_data:
            update_data['location.longitude'] = serializer.validated_data['longitude']
            
        if 'profile_image_url' in serializer.validated_data:
            update_data['profile_image_url'] = serializer.validated_data['profile_image_url']
        
        # Update in Firestore
        db = get_firestore_db()
        farmer_ref = db.collection('farmers').document(uid)
        farmer_ref.update(update_data)
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def verify_aadhar(request):
    """Verify Aadhar number"""
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
    
    serializer = AadharVerificationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        uid = decoded_token['uid']
        
        # In a real implementation, integrate with Aadhar verification API
        # Here we'll simulate successful verification
        
        db = get_firestore_db()
        
        # Update verification status
        db.collection('aadhar_verifications').document(uid).update({
            'verification_status': 'verified',
            'verification_method': 'otp',
            'verification_timestamp': firebase_admin.firestore.SERVER_TIMESTAMP
        })
        
        # Update farmer profile
        db.collection('farmers').document(uid).update({
            'is_verified': True
        })
        
        return Response({
            'success': True,
            'message': 'Aadhar verified successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def logout(request):
    """Logout farmer"""
    # Firebase handles token invalidation on client side
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })
