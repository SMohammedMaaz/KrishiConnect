from rest_framework import serializers

class BuyerProfileSerializer(serializers.Serializer):
    """Serializer for buyer profile data"""
    uid = serializers.CharField(read_only=True)
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    street = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    district = serializers.CharField(required=True)
    state = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    profile_image_url = serializers.URLField(required=False, allow_blank=True)
    buyer_type = serializers.ChoiceField(
        choices=['Individual', 'Business', 'Government'],
        default='Individual'
    )
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

class EmailLoginSerializer(serializers.Serializer):
    """Serializer for email/password login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class EmailSignupSerializer(serializers.Serializer):
    """Serializer for email/password signup"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        """Validate that passwords match"""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data
