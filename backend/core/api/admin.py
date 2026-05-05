from datetime import datetime
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from core.serializers import *
from core.models import *
from core.utils import *

class StoreActivationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, store_id):
        if not isAdmin(request.user):
            return permission_denied()
        try:
            store = Store.objects.select_for_update().get(id=store_id)
            action = (request.data.get("action") or "").lower()
            if action not in ["activate", "deactivate"]:
                return error("Invalid action")
            if action == "activate" and store.is_active:
                return error("Store already active")
            if action == "deactivate" and not store.is_active:
                return error("Store already inactive")
            is_active = True if action == "activate" else False
            store.is_active = is_active
            store.user.is_active = is_active
            store.save()
            store.user.save()
            if action == "activate":
                send_html_mail(
                    subject="Store Activated Successfully",
                    template="emails/store_activation.html",
                    context={
                        "owner": store.user,
                        "store": store,
                        "email": store.user.email,
                        "password": store.user.temp_pass,
                        "login_url": os.getenv("LOGIN_URL"),
                        "current_year": datetime.now().year,
                    },
                    to_email=store.user.email
                )
            else:
                send_html_mail(
                    subject="Store is Deactivated",
                    template="emails/store_deactivation.html",
                    context={
                        "owner": store.user,
                        "store": store,
                        "current_year": datetime.now().year,
                    },
                    to_email=store.user.email
                )
            return success(
                message=f"Store {action}d successfully",
                data_dict={
                    "store_id": store.id,
                    "store_name": store.store_name,
                    "is_active": store.is_active
                }
            )

        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))

class StoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, store_id=None):
        if not isAdmin(request.user):
            return permission_denied()
        try:
            if store_id:
                store = Store.objects.get(id=store_id)
                serializer = StoreSerializer(store)
                return success(data=serializer.data)
            stores = Store.objects.all()
            serializer = StoreSerializer(stores, many=True)
            return success(data=serializer.data)

        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))


class StoreDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, store_id):
        if not isAdmin(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(id=store_id)
            user = store.user
            store.delete()
            if not Store.objects.filter(user=user).exists():
                user.delete()
            return success(message="Store deleted successfully")
        
        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if not isAdmin(request.user):
            return permission_denied()
        try:
            if user_id:
                user = User.objects.get(id=user_id)
                serializer = ProfileSerializer(user)
                return success(data=serializer.data)
            users = User.objects.all().order_by("-id")
            serializer = ProfileSerializer(users, many=True)
            return success(data=serializer.data)

        except User.DoesNotExist:
            return not_found("User")
        except Exception as e:
            return exception(str(e))