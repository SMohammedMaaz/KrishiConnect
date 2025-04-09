from django.db import models

# Note: Most of our data will be stored in Firebase Firestore
# These models are primarily for documentation purposes

class BuyerProfile:
    """
    Represents a buyer profile in Firebase Firestore
    
    Attributes:
        uid (str): Firebase UID
        email (str): Buyer's email address
        full_name (str): Buyer's full name
        phone_number (str): Buyer's phone number
        company_name (str): Company or business name (optional)
        address (dict): Address with street, city, district, state
        location (dict): Lat/Long coordinates
        profile_image_url (str): URL to profile image in Firebase Storage
        created_at (timestamp): Account creation timestamp
        is_verified (bool): Whether identity is verified
        buyer_type (str): Individual/Business/Government
    """
    pass
