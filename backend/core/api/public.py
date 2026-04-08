from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.contrib.auth import get_user_model
from core.serializers import *
from core.models import *
from core.utils import *
from core.services import generate_password

User = get_user_model() 

def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }


class StoreCreateView(APIView):

    @transaction.atomic
    def post(self, request):
        try:
            data = request.data
            email = (data.get("email") or "").strip().lower()
            full_name = (data.get("full_name") or "").strip()
            phone = (data.get("phone") or "").strip()
            if not email or not full_name or not phone:
                return error(error_message="Owner details missing")
            store_data = {
                "store_name": data.get("store_name"),
                "logo": data.get("store_logo"),
                "payment_qr": data.get("payment_qr"),
                "address": data.get("address"),
                "city": data.get("city"),
                "state": data.get("state"),
                "pincode": data.get("pincode"),
                "gmap": data.get("gmap"),
                "upi_id": data.get("upi_id"),
                "acc_holder_name": data.get("account_holder_name"),
                "plan": data.get("plan", "basic"),
                "pay_days": data.get("pay_days", "daily"),
                "is_active": False
            }
            serializer = StoreSerializer(data=store_data)
            if not serializer.is_valid():
                return error(error_dict=serializer.errors)
            user = User.objects.filter(email=email).first()
            if user:
                if user.role != "owner":
                    return error("User already exists with different role")
                store_user = user
                created = False
            else:
                password = generate_password(full_name)
                print(password)
                store_user = User.objects.create_user(
                    email=email,
                    password=password,
                    temp_pass=password,
                    full_name=full_name,
                    phone=phone,
                    role="owner",
                    address=store_data["address"],
                    city=store_data["city"],
                    state=store_data["state"],
                    pincode=store_data["pincode"],
                    is_active=False
                )
                created = True
            if Store.objects.filter(user=store_user).exists():
                return error(error_message="Owner already has a store")
            store = serializer.save(user=store_user)
            return success(
                message="Store created successfully. Awaiting admin approval.",
                data_dict={
                    "store": StoreSerializer(store).data,
                    "owner_password": password if created else None
                }
            )

        except Exception as e:
            return exception(error=str(e))


class LoginView(APIView):

    def post(self, request):
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            user = authenticate(email=email, password=password)
            if user:
                return success(data_dict={
                    "tokens": get_tokens(user),
                    "role": user.role
                })
            return error("Invalid Credentials")

        except Exception as e:
            return exception(str(e))


class RegisterCustomerView(APIView):

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return success("Successfully Registered")
            return error(error_dict=serializer.errors)

        except Exception as e:
            return exception(str(e))