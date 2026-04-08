from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.serializers import *
from core.models import *
from django.contrib.auth import update_session_auth_hash
from core.utils import *

class ProductSpecificView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, prod_id):
        if not (isOwner(request.user) or isCustomer(request.user)):
            return permission_denied()
        try:
            print(request.user.full_name)
            product = Product.objects.get(id=prod_id)
            serializer = ProductSerializer(product)
            return success(data=serializer.data)

        except Product.DoesNotExist:
            return not_found("Product")
        except Exception as e:
            return exception(str(e))


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            user_data = ProfileSerializer(user).data
            store = Store.objects.filter(user=user).first()
            if store:
                store_data = StoreSerializer(store).data
                return success(data_dict={
                    "user": user_data,
                    "store": store_data
                })
            return success(data_dict={"user": user_data})

        except Exception as e:
            return exception(str(e))


    def put(self, request):
        try:
            user = request.user
            serializer = ProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                if isOwner(user):
                    store = Store.objects.get(user=user)
                    if store:
                        store.address = user.address
                        store.city = user.city
                        store.state = user.state
                        store.pincode = user.pincode
                        store.save()
                return success(
                    message="Profile updated successfully",
                    data_dict={"user": serializer.data}
                )
            return error(error_dict=serializer.errors)

        except Exception as e:
            return exception(str(e))


    def delete(self, request):
        try:
            user = request.user
            user.delete()
            return success("Account deleted successfully")

        except Exception as e:
            return exception(str(e))


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            old = request.data.get("old_password")
            new = request.data.get("new_password")
            confirm = request.data.get("confirm_password")
            if not old or not new or not confirm:
                return error("All password fields are required")
            if not user.check_password(old):
                return error("Old password is incorrect")
            if new != confirm:
                return error("Passwords do not match")
            user.set_password(new)
            user.temp_pass("")
            user.save()
            update_session_auth_hash(request, user)
            return success("Password updated successfully")

        except Exception as e:
            return exception(str(e))