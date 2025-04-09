from .firebase_config import FIREBASE_CONFIG
from django.conf import settings

def firebase_config(request):
    """
    Provides Firebase configuration to templates
    """
    return {
        'firebase_config': FIREBASE_CONFIG,
        'google_maps_api_key': settings.GOOGLE_MAPS_API_KEY,
    }