import uuid, qrcode
from io import BytesIO
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from core.models import *
from core.utils import send_html_mail
from decimal import Decimal

def generate_password(full_name):
    first_word = full_name.split()[0].title()
    rand = uuid.uuid4().hex[:4]
    return f"{first_word}@{rand}"


def create_product_qr_code(instance):
    try:
        product_number = f"SQPROD-{uuid.uuid4().hex[:10].upper()}"
        qr = qrcode.make(product_number)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        filename = f"{product_number}.png"
        instance.product_qr.save(
            filename,
            ContentFile(buffer.getvalue()),
            save=False
        )
        return product_number

    except Exception as e:
        print(e)
        return None


def create_order_qr_code(instance):
    try:
        qr = qrcode.make(instance.order_number)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        filename = f"{instance.order_number}.png"
        instance.order_qr.save(
            filename,
            ContentFile(buffer.getvalue()),
            save=False
        )

    except Exception as e:
        print(e)


class CartService:
    @staticmethod
    @transaction.atomic
    def add_to_cart(user, store, product_id, qty):
        if qty <= 0:
            raise ValidationError("Quantity must be positive")
        product = Product.objects.select_for_update().get(id=product_id)
        if product.store_id != store.id:
            raise ValidationError("Product does not belong to this store")
        if product.qty < qty:
            raise ValidationError("Insufficient stock")
        cart, _ = Cart.objects.get_or_create(user=user, store=store)
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"qty": qty, "price_at_purchase": product.price}
        )
        if not created:
            if product.qty < qty:
                raise ValidationError("Insufficient stock")
            item.qty += qty
        product.qty -= qty
        product.save()
        item.save()
        return item


    @staticmethod
    @transaction.atomic
    def update_cart_item(item_id, new_qty):
        if new_qty <= 0:
            raise ValidationError("Quantity must be positive")
        item = CartItem.objects.select_for_update().get(id=item_id)
        product = item.product
        diff = new_qty - item.qty
        if diff > 0:
            if product.qty < diff:
                raise ValidationError("Insufficient stock")
            product.qty -= diff
        else:
            product.qty += abs(diff)
        item.qty = new_qty
        product.save()
        item.save()
        return item


    @staticmethod
    @transaction.atomic
    def remove_from_cart(item_id):
        item = CartItem.objects.select_for_update().get(id=item_id)
        product = item.product
        product.qty += item.qty
        product.save()
        item.delete()
    

class OrderService:
    @staticmethod
    @transaction.atomic
    def checkout(user, store):
        cart_items = CartItem.objects.filter(
            cart__user=user,
            cart__store=store
        ).select_related("product")
        if not cart_items.exists():
            raise ValidationError("Cart is empty")
        order = Order.objects.create(
            user=user,
            store=store,
            total_amount=0,
            order_number=f"SQORD-{uuid.uuid4().hex[:10].upper()}",
        )
        total = 0
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                qty=item.qty,
                price_at_purchase=item.price_at_purchase
            )
            total += item.price_at_purchase * item.qty
        order.total_amount = total
        commission_percent = Decimal(PLANS_PRICES.get(store.plan, 0))
        commission_amount = total * (commission_percent / Decimal("100"))
        net_amount = total - commission_amount
        AmountGenerated.objects.create(
            store=store,
            amount=net_amount,
            date=timezone.now()
        )
        order.save()
        create_order_qr_code(order)
        order.save()
        cart_items.delete()
        send_html_mail(
            subject="Order Confirmation",
            template="emails/order_confirmation.html",
            context={
                "user": user,
                "order": order,
                "items": order.items.all(),
                "store": store,
                "current_year": datetime.now().year,
            },
            to_email=user.email
        )
        return order