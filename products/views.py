from django.shortcuts import render
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

import json
import uuid
import firebase_admin
from firebase_admin import firestore
from krishiconnect.firebase_config import get_firestore_db, verify_firebase_token
from .serializers import ProductSerializer, ProductSearchSerializer
from farmers.utils import get_farmer_by_uid

@api_view(['POST'])
def create_product(request):
    """Create a new product listing"""
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
    
    # Check if user is a farmer
    uid = decoded_token['uid']
    
    # Verify user is a farmer by checking custom claims
    try:
        user = firebase_admin.auth.get_user(uid)
        custom_claims = user.custom_claims or {}
        
        if custom_claims.get('role') != 'farmer':
            return Response(
                {'error': 'Only farmers can create product listings'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Validate product data
    serializer = ProductSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get farmer data
        db = get_firestore_db()
        farmer_doc = db.collection('farmers').document(uid).get()
        
        if not farmer_doc.exists:
            return Response(
                {'error': 'Farmer profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        farmer_data = farmer_doc.to_dict()
        
        # Generate a unique ID for the product
        product_id = str(uuid.uuid4())
        
        # Prepare product data
        product_data = {
            'id': product_id,
            'farmer_id': uid,
            'name': serializer.validated_data['name'],
            'category': serializer.validated_data['category'],
            'description': serializer.validated_data['description'],
            'quantity': serializer.validated_data['quantity'],
            'unit': serializer.validated_data['unit'],
            'price': serializer.validated_data['price'],
            'location': {
                'latitude': serializer.validated_data.get('latitude', farmer_data.get('location', {}).get('latitude', 0)),
                'longitude': serializer.validated_data.get('longitude', farmer_data.get('location', {}).get('longitude', 0)),
            },
            'address': {
                'village': serializer.validated_data.get('village', farmer_data.get('address', {}).get('village', '')),
                'district': serializer.validated_data.get('district', farmer_data.get('address', {}).get('district', '')),
                'state': serializer.validated_data.get('state', farmer_data.get('address', {}).get('state', '')),
            },
            'image_urls': serializer.validated_data.get('image_urls', []),
            'created_at': firebase_admin.firestore.SERVER_TIMESTAMP,
            'updated_at': firebase_admin.firestore.SERVER_TIMESTAMP,
            'is_available': True,
            'quality_grade': serializer.validated_data.get('quality_grade', ''),
            # Add farmer name for easier queries
            'farmer_name': farmer_data.get('full_name', '')
        }
        
        # Save to Firestore
        db.collection('products').document(product_id).set(product_data)
        
        return Response({
            'success': True,
            'message': 'Product created successfully',
            'product_id': product_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_products(request):
    """List all available products"""
    try:
        db = get_firestore_db()
        
        # Get only available products
        query = db.collection('products').where('is_available', '==', True).order_by('created_at', direction=firestore.Query.DESCENDING)
        
        # Optional pagination
        limit = request.query_params.get('limit', 20)
        try:
            limit = int(limit)
        except ValueError:
            limit = 20
            
        query = query.limit(limit)
        
        # Execute query
        products = list(query.stream())
        
        # Convert to list of dicts
        product_list = [doc.to_dict() for doc in products]
        
        return Response(product_list)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product(request, product_id):
    """Get a specific product by ID"""
    try:
        db = get_firestore_db()
        product_doc = db.collection('products').document(product_id).get()
        
        if not product_doc.exists:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        product_data = product_doc.to_dict()
        
        # Get farmer details (excluding sensitive info)
        farmer_id = product_data['farmer_id']
        farmer_doc = db.collection('farmers').document(farmer_id).get()
        
        if farmer_doc.exists:
            farmer_data = farmer_doc.to_dict()
            product_data['farmer'] = {
                'name': farmer_data.get('full_name', ''),
                'village': farmer_data.get('address', {}).get('village', ''),
                'district': farmer_data.get('address', {}).get('district', ''),
                'state': farmer_data.get('address', {}).get('state', '')
            }
        
        return Response(product_data)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_product(request, product_id):
    """Update a product"""
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
    
    uid = decoded_token['uid']
    
    # Partial update allowed
    serializer = ProductSerializer(data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        db = get_firestore_db()
        
        # Check if product exists and belongs to this farmer
        product_doc = db.collection('products').document(product_id).get()
        
        if not product_doc.exists:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        product_data = product_doc.to_dict()
        
        if product_data['farmer_id'] != uid:
            return Response({
                'error': 'You do not have permission to update this product'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Update fields
        update_data = {
            'updated_at': firebase_admin.firestore.SERVER_TIMESTAMP
        }
        
        # Map serializer fields to Firestore fields
        field_mapping = {
            'name': 'name',
            'category': 'category',
            'description': 'description',
            'quantity': 'quantity',
            'unit': 'unit',
            'price': 'price',
            'latitude': 'location.latitude',
            'longitude': 'location.longitude',
            'village': 'address.village',
            'district': 'address.district',
            'state': 'address.state',
            'image_urls': 'image_urls',
            'quality_grade': 'quality_grade',
            'is_available': 'is_available'
        }
        
        for field, firestore_field in field_mapping.items():
            if field in serializer.validated_data:
                update_data[firestore_field] = serializer.validated_data[field]
        
        # Update in Firestore
        db.collection('products').document(product_id).update(update_data)
        
        return Response({
            'success': True,
            'message': 'Product updated successfully'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_product(request, product_id):
    """Delete a product (or mark as unavailable)"""
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
    
    uid = decoded_token['uid']
    
    try:
        db = get_firestore_db()
        
        # Check if product exists and belongs to this farmer
        product_doc = db.collection('products').document(product_id).get()
        
        if not product_doc.exists:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        product_data = product_doc.to_dict()
        
        if product_data['farmer_id'] != uid:
            return Response({
                'error': 'You do not have permission to delete this product'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Instead of deleting, mark as unavailable
        db.collection('products').document(product_id).update({
            'is_available': False,
            'updated_at': firebase_admin.firestore.SERVER_TIMESTAMP
        })
        
        return Response({
            'success': True,
            'message': 'Product marked as unavailable'
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_farmer_products(request, farmer_id):
    """Get all products by a specific farmer"""
    try:
        db = get_firestore_db()
        
        # Check if farmer exists
        farmer_doc = db.collection('farmers').document(farmer_id).get()
        
        if not farmer_doc.exists:
            return Response({
                'error': 'Farmer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get only available products by default
        show_all = request.query_params.get('all', 'false').lower() == 'true'
        
        if show_all:
            query = db.collection('products').where('farmer_id', '==', farmer_id)
        else:
            query = db.collection('products').where('farmer_id', '==', farmer_id).where('is_available', '==', True)
        
        # Sort by created date (newest first)
        query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
        
        # Execute query
        products = list(query.stream())
        
        # Convert to list of dicts
        product_list = [doc.to_dict() for doc in products]
        
        return Response(product_list)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def search_products(request):
    """Search for products based on various criteria"""
    serializer = ProductSearchSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        db = get_firestore_db()
        
        # Start with base query - only available products
        query = db.collection('products').where('is_available', '==', True)
        
        # Add filters based on search criteria
        if serializer.validated_data.get('category'):
            query = query.where('category', '==', serializer.validated_data['category'])
        
        if serializer.validated_data.get('district'):
            query = query.where('address.district', '==', serializer.validated_data['district'])
            
        if serializer.validated_data.get('state'):
            query = query.where('address.state', '==', serializer.validated_data['state'])
        
        # Note: For more complex queries (price ranges, proximity search, text search),
        # we would need either Firebase indexes or post-filtering
        
        # Execute query
        products = list(query.stream())
        
        # Convert to list of dicts
        product_list = [doc.to_dict() for doc in products]
        
        # Apply post-filtering that can't be done directly in Firestore
        if serializer.validated_data.get('min_price') is not None:
            product_list = [p for p in product_list if p['price'] >= serializer.validated_data['min_price']]
            
        if serializer.validated_data.get('max_price') is not None:
            product_list = [p for p in product_list if p['price'] <= serializer.validated_data['max_price']]
            
        # Text search on name and description
        if serializer.validated_data.get('query'):
            query_term = serializer.validated_data['query'].lower()
            product_list = [
                p for p in product_list 
                if query_term in p['name'].lower() or query_term in p['description'].lower()
            ]
        
        # Location-based filtering would require additional calculation
        # This is just a simplified version
        if serializer.validated_data.get('latitude') and serializer.validated_data.get('longitude'):
            # For a real implementation, use geospatial calculations
            pass
        
        return Response(product_list)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_crop_suggestions(request):
    """Get AI-based crop suggestions (placeholder)"""
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
    
    # This is a placeholder for the AI suggestion engine
    # In a real implementation, we would:
    # 1. Get farmer's location
    # 2. Get soil data, weather data, market demand data
    # 3. Run ML model to generate suggestions
    # 4. Return formatted results
    
    # For now, return a static suggestion
    suggestions = [
        {
            'crop': 'Rice',
            'confidence': 85,
            'reason': 'Based on your location and current season',
            'expected_price': '₹1800-2200 per quintal',
            'recommended_fertilizers': ['NPK 10-26-26', 'Urea'],
            'soil_suitability': 'High'
        },
        {
            'crop': 'Cotton',
            'confidence': 75,
            'reason': 'Good market demand in your region',
            'expected_price': '₹5500-6000 per quintal',
            'recommended_fertilizers': ['NPK 20-20-0', 'Potash'],
            'soil_suitability': 'Medium'
        },
        {
            'crop': 'Pulses (Moong)',
            'confidence': 65,
            'reason': 'Suitable for crop rotation after rice',
            'expected_price': '₹7000-8000 per quintal',
            'recommended_fertilizers': ['DAP', 'NPK 12-32-16'],
            'soil_suitability': 'High'
        }
    ]
    
    return Response({
        'success': True,
        'message': 'Crop suggestions generated',
        'note': 'This is a placeholder. Actual AI predictions will be integrated later.',
        'suggestions': suggestions
    })
