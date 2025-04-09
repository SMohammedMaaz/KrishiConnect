from django.db import models

# Note: Most of our data will be stored in Firebase Firestore
# These models are primarily for documentation purposes

class FarmerProfile:
    """
    Represents a farmer profile in Firebase Firestore
    
    Attributes:
        uid (str): Firebase UID
        phone_number (str): Farmer's phone number
        full_name (str): Farmer's full name
        aadhar_number (str): Aadhar card number (verified)
        address (dict): Address with village, district, state
        location (dict): Lat/Long coordinates
        profile_image_url (str): URL to profile image in Firebase Storage
        created_at (timestamp): Account creation timestamp
        is_verified (bool): Whether identity is verified
    """
    pass

class FarmerAadharVerification:
    """
    Represents Aadhar verification records in Firebase Firestore
    
    Attributes:
        uid (str): Firebase UID
        aadhar_number (str): Aadhar card number
        verification_status (str): pending/verified/rejected
        verification_method (str): How verification was done
        verification_timestamp (timestamp): When verification occurred
    """
    pass
