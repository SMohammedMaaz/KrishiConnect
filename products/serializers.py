from rest_framework import serializers

class ProductSerializer(serializers.Serializer):
    """Serializer for product data"""
    id = serializers.CharField(read_only=True)
    farmer_id = serializers.CharField(read_only=True)
    name = serializers.CharField(required=True)
    category = serializers.CharField(required=True)
    description = serializers.CharField(required=True)
    quantity = serializers.FloatField(required=True)
    unit = serializers.CharField(required=True)
    price = serializers.FloatField(required=True)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    village = serializers.CharField(required=False)
    district = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=[]
    )
    quality_grade = serializers.CharField(required=False, allow_blank=True)
    
    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero")
        return value
    
    def validate_quantity(self, value):
        """Validate quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero")
        return value

class ProductSearchSerializer(serializers.Serializer):
    """Serializer for product search parameters"""
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    min_price = serializers.FloatField(required=False, allow_null=True)
    max_price = serializers.FloatField(required=False, allow_null=True)
    district = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    radius = serializers.FloatField(required=False, default=50)  # km
