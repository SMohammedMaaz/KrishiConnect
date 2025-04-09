from django.db import models

# Note: Most of our data will be stored in Firebase Firestore
# These models are primarily for documentation purposes

class Product:
    """
    Represents a product in Firebase Firestore
    
    Attributes:
        id (str): Product ID
        farmer_id (str): Firebase UID of the farmer
        name (str): Product name (e.g., Rice, Wheat)
        category (str): Category (e.g., Grains, Vegetables)
        description (str): Product description
        quantity (float): Available quantity
        unit (str): Unit of measurement (kg, ton, etc.)
        price (float): Price per unit
        location (dict): Lat/Long coordinates
        address (dict): Address with village, district, state
        images (list): List of image URLs
        created_at (timestamp): When the product was listed
        updated_at (timestamp): When the product was last updated
        is_available (bool): Whether the product is still available
        quality_grade (str): Quality grading if applicable
    """
    pass
