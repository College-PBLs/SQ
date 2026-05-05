from django.urls import path
from core.api.public import *
from core.api.authorized import *
from core.api.admin import *
from core.api.owner import *
from core.api.guard import *
from core.api.customer import *

urlpatterns = [
    # PUBLIC ENDPOINTS
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterCustomerView.as_view(), name='register'),

    # SCAN QR
    path('scan/order-qr/', ScanQRView.as_view(), name='scan-order-qr'),

    # STORE VIEW
    path('store/create/', StoreCreateView.as_view(), name='store-create'),
    path('store/<int:store_id>/activation/', StoreActivationView.as_view(), name='store-activation'),
    path('stores/', StoreView.as_view(), name='stores'),
    path('store/<int:store_id>/', StoreView.as_view(), name='store-detail'),
    path('active-stores/', StoreActiveView.as_view(), name='active-stores'),
    path('active-store/<int:store_id>/', StoreActiveView.as_view(), name='active-store-detail'),
    path('store/update/', StoreUpdateView.as_view(), name='update-store'),
    path('store/delete/<int:store_id>/', StoreDeleteView.as_view(), name='store-detail'),
    # PRODUCT VIEW
    path('store/products/', ProductView.as_view(), name='owner-product'),
    path('store/get-product/<int:prod_id>/', ProductSpecificView.as_view(), name='get-owner-product'),
    path('store/product/<int:prod_id>/', ProductView.as_view(), name='owner-product-detail'),
    path('store/product/<int:prod_id>/get-qr/', ProductQRView.as_view(), name='owner-product-qr'),
    # STORE ORDERS
    path('store/orders/', OrderView.as_view(), name='owner-orders'),
    path('store/order/<int:order_id>/', OrderView.as_view(), name='owner-order-detail'),

    # GUARD
    path('store/guards/', GuardView.as_view(), name='store-guards'),
    path('store/guard/<int:guard_id>/', GuardView.as_view(), name='store-guard-details'),

    # USER CART
    path('user/carts/', CartView.as_view(), name='carts'),
    path('user/cart/<int:cart_id>/', CartView.as_view(), name='cart-detail'),
    path('user/cart-item/', CartItemView.as_view(), name='cart-item-add'),
    path('user/cart-item/<int:item_id>/', CartItemView.as_view(), name='cart-item-update'),
    # USER ORDERS
    path('user/orders/', OrderUserView.as_view(), name='orders'),
    path('user/order/<int:order_id>/', OrderUserView.as_view(), name='order-detail'),
    path('user/order/<int:order_id>/qr/', OrderQRView.as_view(), name='order-qr'),

    # PROFILE BASED ENDPOINTS
    path('profile/', ProfileView.as_view(), name='profile_apis'),
    path('profile/update-location/', UpdateLocationView.as_view(), name='update_location'),
    path('profile/update-password/', ChangePasswordView.as_view(), name='change_password'),
]