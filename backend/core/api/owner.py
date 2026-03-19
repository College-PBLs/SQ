from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.serializers import *
from core.models import *
from core.utils import *
from core.services import create_product_qr_code, generate_password
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime
from django.db import transaction

class StoreUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if not isOwner(request.user):
            return permission_denied()

        try:
            store = Store.objects.get(user=request.user)
            serializer = StoreSerializer(store, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                user = request.user
                user.city = serializer.validated_data.get("city", user.city)
                user.state = serializer.validated_data.get("state", user.state)
                user.address = serializer.validated_data.get("address", user.address)
                user.pincode = serializer.validated_data.get("pincode", user.pincode)
                user.save()
                return success("Store updated successfully", serializer.data)
            return error(error_dict=serializer.errors)

        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))


class ProductView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            products = Product.objects.filter(store=store)
            serializer = ProductSerializer(products, many=True)
            return success(data=serializer.data)

        except Exception as e:
            return exception(str(e))


    def post(self, request):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                product = serializer.save(store=store)
                product_number = create_product_qr_code(product)
                product.product_number = product_number
                product.save()
                return success("Product added successfully")
            return error(error_dict=serializer.errors)

        except Exception as e:
            return exception(str(e))


    def put(self, request, prod_id):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            product = Product.objects.get(id=prod_id, store=store)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return success("Product updated successfully")
            return error(error_dict=serializer.errors)

        except Product.DoesNotExist:
            return not_found("Product")
        except Exception as e:
            return exception(str(e))


    def delete(self, request, prod_id):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            product = Product.objects.get(id=prod_id, store=store)
            product.delete()
            return success("Product deleted successfully")

        except Product.DoesNotExist:
            return not_found("Product")
        except Exception as e:
            return exception(str(e))


class ProductQRView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, prod_id):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            product = Product.objects.get(id=prod_id, store=store)
            if product.product_qr:
                return success(data={"product_qr": product.product_qr.url})
            product_number = create_product_qr_code(product)
            if not product_number:
                raise Exception("QR generation failed")
            product.product_number = product_number
            product.save()
            return success(data={"product_qr": product.product_qr.url})

        except Product.DoesNotExist:
            return not_found("Product")
        except Exception as e:
            return exception(str(e))


class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id=None):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            if order_id:
                order = Order.objects.get(id=order_id, store=store)
                serializer = StoreOrderSerializer(order)
                return success(data=serializer.data)
            today = timezone.localdate()
            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            start_date = parse_date(start_date) if start_date else today
            end_date = parse_date(end_date) if end_date else today
            orders = Order.objects.filter(
                store=store,
                date__date__range=[start_date, end_date]
            ).order_by("-date")
            serializer = StoreOrderSerializer(orders, many=True)
            return success(data=serializer.data)

        except Order.DoesNotExist:
            return not_found("Order")
        except Exception as e:
            return exception(str(e))

    def delete(self, request, order_id):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = Store.objects.get(user=request.user)
            order = Order.objects.get(id=order_id, store=store)
            order.delete()
            return success("Order deleted successfully")

        except Order.DoesNotExist:
            return not_found("Order")
        except Exception as e:
            return exception(str(e))
        

class GuardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_store(self, user):
        store = Store.objects.filter(user=user).first()
        if not store:
            raise Exception("Store not found")
        return store


    def get(self, request, guard_id=None):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = self.get_store(request.user)
            if guard_id:
                guard = Guard.objects.get(id=guard_id, store=store)
                serializer = GuardSerializer(guard)
                return success(data=serializer.data)
            guards = Guard.objects.filter(store=store)
            serializer = GuardSerializer(guards, many=True)
            return success(data=serializer.data)

        except Guard.DoesNotExist:
            return not_found("Guard")
        except Exception as e:
            return exception(str(e))


    def post(self, request):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = self.get_store(request.user)
            full_name = request.data.get("full_name")
            email = request.data.get("email")
            phone = request.data.get("phone")
            if not all([full_name, email, phone]):
                return error("full_name, email, phone required")
            if User.objects.filter(email=email).exists():
                return error("User already exists")
            temp_pass = generate_password(full_name)
            guard_user = User.objects.create(
                full_name=full_name,
                email=email,
                phone=phone,
                role="guard",
                temp_pass=temp_pass
            )
            guard_user.set_password(temp_pass)
            guard_user.save()
            Guard.objects.create(
                user=guard_user,
                store=store
            )
            context = {
                "guard_name": guard_user.full_name,
                "email": guard_user.email,
                "temp_password": temp_pass,
                "store_name": store.store_name,
                "login_url": os.getenv("LOGIN_URL"),
                "current_year": datetime.now().year
            }
            send_html_mail(
                subject="Guard Account Created",
                template="emails/guard_credentials.html",
                context=context,
                to_email=guard_user.email
            )
            return success("Guard created and assigned successfully")

        except Exception as e:
            return exception(str(e))


    def delete(self, request, guard_id):
        if not isOwner(request.user):
            return permission_denied()
        try:
            store = self.get_store(request.user)
            guard = Guard.objects.select_related("user").get(id=guard_id, store=store)
            guard_user = guard.user
            context = {
                "guard_name": guard_user.full_name,
                "store_name": store.store_name,
                "current_year": datetime.now().year
            }
            send_html_mail(
                subject="Guard Account Removed",
                template="emails/guard_removed.html",
                context=context,
                to_email=guard_user.email
            )
            with transaction.atomic():
                guard.delete()
                guard_user.delete()
            return success("Guard and user deleted successfully")

        except Guard.DoesNotExist:
            return not_found("Guard")
        except Exception as e:
            return exception(str(e))