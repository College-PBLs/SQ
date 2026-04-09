from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.models import *
from core.utils import *
from core.services import *
from core.serializers import *

class UpdateLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            user = request.user
            city = request.data.get("city")
            state = request.data.get("state")
            address = request.data.get("address")
            pincode = request.data.get("pincode")
            if not city or not state or not address or not pincode:
                return error("All location fields are required")
            user.city = city
            user.state = state
            user.address = address
            user.pincode = pincode
            user.save()
            return success(message="Location updated successfully", data=ProfileSerializer(user).data)

        except Exception as e:
            return exception(str(e))


class StoreActiveView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, store_id=None):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            if store_id:
                store = Store.objects.get(id=store_id, is_active=True)
                serializer = StoreSerializer(store)
                return success(data=serializer.data)
            stores = Store.objects.filter(is_active=True)
            serializer = StoreSerializer(stores, many=True)
            return success(data=serializer.data)

        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, cart_id=None):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            if cart_id:
                cart = Cart.objects.get(id=cart_id, user=request.user)
                serializer = CartSerializer(cart)
                return success(data=serializer.data)
            carts = Cart.objects.filter(user=request.user)
            serializer = CartSerializer(carts, many=True)
            return success(data=serializer.data)

        except Cart.DoesNotExist:
            return not_found("Cart")
        except Exception as e:
            return exception(str(e))


    @transaction.atomic
    def delete(self, request, cart_id):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            cart = Cart.objects.select_for_update().get(id=cart_id, user=request.user)
            for item in cart.items.select_for_update():
                item.product.qty += item.qty
                item.product.save()
            cart.delete()
            return success("Cart deleted successfully")

        except Cart.DoesNotExist:
            return not_found("Cart")
        except Exception as e:
            return exception(str(e))


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            product_number = request.data.get("product_number")
            qty = request.data.get("qty", 1)
            if not product_number:
                return error("Product Number required")
            qty = int(qty)
            product = Product.objects.get(product_number=product_number)
            item = CartService.add_to_cart(
                user=request.user,
                store=product.store,
                product_id=product.id,
                qty=qty
            )
            return success(
                message="Added to cart",
                data_dict={"item_id": item.id}
            )

        except Product.DoesNotExist:
            return not_found("Product")
        except Exception as e:
            return exception(str(e))


    def patch(self, request, item_id):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            qty = request.data.get("qty")
            if not qty:
                return error("Qty required")
            qty = int(qty)
            CartService.update_cart_item(item_id, qty)
            return success("Cart updated")
        
        except CartItem.DoesNotExist:
            return not_found("CartItem")
        except Exception as e:
            return exception(str(e))
        

    def delete(self, request, item_id):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            CartService.remove_from_cart(item_id)
            return success("Cart item removed")

        except CartItem.DoesNotExist:
            return not_found("CartItem")
        except Exception as e:
            return exception(str(e))


class OrderUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id=None):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            if order_id:
                order = Order.objects.get(id=order_id, user=request.user)
                serializer = UserOrderSerializer(order)
                return success(data=serializer.data)
            orders = Order.objects.filter(user=request.user).order_by("-date")
            serializer = UserOrderSerializer(orders, many=True)
            return success(data=serializer.data)

        except Order.DoesNotExist:
            return not_found("Order")
        except Exception as e:
            return exception(str(e))


    def post(self, request):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            store_id = request.data.get("store_id")
            if not store_id:
                return error("Store ID required")
            store = Store.objects.get(id=store_id, is_active=True)
            if not CartItem.objects.filter(cart__user=request.user, cart__store=store).exists():
                return error("Cart empty")
            order = OrderService.checkout(
                user=request.user,
                store=store
            )
            return success(
                message="Order placed successfully",
                data_dict={
                    "order_id": order.id,
                    "qr": order.order_qr.url
                }
            )

        except Store.DoesNotExist:
            return not_found("Store")
        except Exception as e:
            return exception(str(e))


class OrderQRView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        if not isCustomer(request.user):
            return permission_denied()
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            return success(data_dict={"qr": order.order_qr.url})

        except Order.DoesNotExist:
            return not_found("Order")
        except Exception as e:
            return exception(str(e))