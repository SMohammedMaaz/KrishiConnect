from functools import wraps
from django.http import JsonResponse
from krishiconnect.firebase_config import verify_firebase_token
import firebase_admin
from firebase_admin import auth as firebase_auth

def firebase_auth_required(view_func):
    """Decorator to check Firebase authentication"""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        if not id_token:
            return JsonResponse({'error': 'No authorization token provided'}, status=401)
        
        try:
            # Verify the token
            decoded_token = verify_firebase_token(id_token)
            if not decoded_token:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            
            # Add the user info to the request
            request.firebase_user = decoded_token
            
            return view_func(request, *args, **kwargs)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    
    return wrapped_view

def farmer_role_required(view_func):
    """Decorator to check if user has farmer role"""
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not hasattr(request, 'firebase_user'):
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        # Check if user has farmer role
        uid = request.firebase_user['uid']
        try:
            user = firebase_auth.get_user(uid)
            custom_claims = user.custom_claims or {}
            
            if custom_claims.get('role') != 'farmer':
                return JsonResponse({'error': 'Access denied. Farmer role required'}, status=403)
            
            return view_func(request, *args, **kwargs)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return wrapped_view
