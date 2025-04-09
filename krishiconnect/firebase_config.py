import os
import logging
from django.conf import settings

# Set up logger
logger = logging.getLogger(__name__)

# Flag to indicate we're in demo mode without actual Firebase
DEMO_MODE = True

# Firebase configuration for templates
FIREBASE_CONFIG = {
    'apiKey': settings.FIREBASE_API_KEY,
    'authDomain': settings.FIREBASE_AUTH_DOMAIN,
    'projectId': settings.FIREBASE_PROJECT_ID,
    'storageBucket': settings.FIREBASE_STORAGE_BUCKET,
    'messagingSenderId': settings.FIREBASE_MESSAGING_SENDER_ID,
    'appId': settings.FIREBASE_APP_ID,
    'measurementId': settings.FIREBASE_MEASUREMENT_ID,
    'databaseURL': settings.FIREBASE_DATABASE_URL
}

# Function that acts as if it initializes Firebase Admin SDK
def initialize_firebase():
    if DEMO_MODE:
        logger.warning("Running in demo mode without actual Firebase credentials")
    else:
        try:
            import firebase_admin
            from firebase_admin import credentials, auth, firestore, storage
            
            # Check if already initialized
            if not firebase_admin._apps:
                # Use service account credentials from environment or default file
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID", ""),
                    "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL", ""),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID", ""),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL", "")
                })
                
                firebase_admin.initialize_app(cred, {
                    'storageBucket': settings.FIREBASE_STORAGE_BUCKET,
                    'databaseURL': settings.FIREBASE_DATABASE_URL
                })
        except Exception as e:
            logger.error(f"Firebase initialization error: {e}")

# Initialize when the module is imported
initialize_firebase()

# Helper functions for Firebase services
def get_firestore_db():
    """Get Firestore database instance (or mock for demo)"""
    if DEMO_MODE:
        from django.http import Http404
        # Return a mock object that will handle calls without errors
        class MockFirestore:
            def collection(self, *args, **kwargs):
                return self
            def document(self, *args, **kwargs):
                return self
            def where(self, *args, **kwargs):
                return self
            def stream(self, *args, **kwargs):
                return []
            def get(self, *args, **kwargs):
                return None
            def set(self, *args, **kwargs):
                logger.info("Mock set operation in demo mode")
                return True
            def update(self, *args, **kwargs):
                logger.info("Mock update operation in demo mode")
                return True
            def delete(self, *args, **kwargs):
                logger.info("Mock delete operation in demo mode")
                return True
        return MockFirestore()
    else:
        import firebase_admin
        from firebase_admin import firestore
        initialize_firebase()
        return firestore.client()

def get_firebase_auth():
    """Get Firebase Auth instance (or mock for demo)"""
    if DEMO_MODE:
        # Return a mock auth object
        class MockAuth:
            def verify_id_token(self, *args, **kwargs):
                # Return mock user data for demo
                return {
                    "uid": "demo-user-id",
                    "email": "demo@example.com",
                    "phone_number": "+919876543210",
                    "role": "demo"
                }
        return MockAuth()
    else:
        import firebase_admin
        from firebase_admin import auth
        initialize_firebase()
        return auth

def get_firebase_storage():
    """Get Firebase Storage bucket (or mock for demo)"""
    if DEMO_MODE:
        # Return a mock storage object
        class MockStorage:
            def blob(self, *args, **kwargs):
                class MockBlob:
                    def upload_from_file(self, *args, **kwargs):
                        logger.info("Mock file upload in demo mode")
                        return "https://example.com/demo-image.jpg"
                    def upload_from_string(self, *args, **kwargs):
                        logger.info("Mock string upload in demo mode")
                        return "https://example.com/demo-image.jpg"
                    def generate_signed_url(self, *args, **kwargs):
                        return "https://example.com/demo-image.jpg"
                return MockBlob()
        return MockStorage()
    else:
        import firebase_admin
        from firebase_admin import storage
        initialize_firebase()
        return storage.bucket()

def verify_firebase_token(id_token):
    """Verify Firebase ID token and return decoded token (or mock for demo)"""
    if DEMO_MODE:
        # Return mock token data for demo
        return {
            "uid": "demo-user-id",
            "email": "demo@example.com",
            "phone_number": "+919876543210",
            "role": "demo"
        }
    else:
        try:
            import firebase_admin
            from firebase_admin import auth
            initialize_firebase()
            return auth.verify_id_token(id_token)
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return None
