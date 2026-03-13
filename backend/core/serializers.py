from rest_framework import serializers
from core.models import *

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['full_name', 'phone', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=validated_data['phone'],
            role='customer'
        )


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['temp_pass', 'last_login', 'password','is_superuser','first_name','last_name','is_staff','is_active','date_joined','groups','user_permissions']


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = "__all__"
        read_only_fields = ['user']


class GuardSerializer(serializers.ModelSerializer):
    user_detail = ProfileSerializer(source='user', read_only=True)
    store_detail = StoreSerializer(source='store', read_only=True)

    class Meta:
        model = Guard
        fields = ['id', 'user_detail', 'store_detail']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["store", "product_number", "product_qr"]
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate_qty(self, value):
        if value < 0:
            raise serializers.ValidationError("Qty cannot be negative")
        return value


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = CartItem
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    store_detail = StoreSerializer(source='store', read_only=True)

    class Meta:
        model = Cart
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = "__all__"


class UserOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    store_detail = StoreSerializer(source='store', read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ['user', 'total_amount', 'order_number', 'order_qr']


class StoreOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = ProfileSerializer(read_only=True)
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ['total_amount', 'order_number', 'order_qr']


class AmountGeneratedSerializer(serializers.ModelSerializer):
    store_detail = StoreSerializer(source='store', read_only=True)

    class Meta:
        model = AmountGenerated
        fields = "__all__"