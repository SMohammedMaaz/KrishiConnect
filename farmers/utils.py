from krishiconnect.firebase_config import get_firestore_db
import firebase_admin

def get_farmer_by_uid(uid):
    """Get farmer data from Firestore by UID"""
    db = get_firestore_db()
    farmer_doc = db.collection('farmers').document(uid).get()
    
    if not farmer_doc.exists:
        return None
        
    return farmer_doc.to_dict()

def get_farmer_by_phone(phone_number):
    """Get farmer data from Firestore by phone number"""
    db = get_firestore_db()
    query = db.collection('farmers').where('phone_number', '==', phone_number).limit(1)
    
    results = list(query.stream())
    if not results:
        return None
        
    return results[0].to_dict()

def check_aadhar_verification_status(uid):
    """Check Aadhar verification status for a farmer"""
    db = get_firestore_db()
    verification_doc = db.collection('aadhar_verifications').document(uid).get()
    
    if not verification_doc.exists:
        return 'not_found'
        
    verification_data = verification_doc.to_dict()
    return verification_data.get('verification_status', 'unknown')

def count_verified_farmers():
    """Count the number of verified farmers"""
    db = get_firestore_db()
    query = db.collection('farmers').where('is_verified', '==', True)
    
    # Note: This is not efficient for very large collections
    # For production, use Firebase's count functionality or Cloud Functions
    return len(list(query.stream()))
