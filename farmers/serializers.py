from rest_framework import serializers

class FarmerProfileSerializer(serializers.Serializer):
    """Serializer for farmer profile data"""
    uid = serializers.CharField(read_only=True)
    phone_number = serializers.CharField()
    full_name = serializers.CharField(required=True)
    aadhar_number = serializers.CharField(required=True, write_only=True)  # For security, write-only
    village = serializers.CharField(required=True)
    district = serializers.CharField(required=True)
    state = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    profile_image_url = serializers.URLField(required=False, allow_blank=True)
    
    def validate_aadhar_number(self, value):
        """Validate Aadhar number format (12 digits)"""
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError("Aadhar number must be 12 digits")
        return value

    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

class AadharVerificationSerializer(serializers.Serializer):
    """Serializer for Aadhar verification"""
    aadhar_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True)  # OTP received for verification

class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP"""
    phone_number = serializers.CharField(required=True)
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    phone_number = serializers.CharField(required=True)
    otp = serializers.CharField(required=True)
    verification_id = serializers.CharField(required=True)
