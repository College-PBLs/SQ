from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from django.utils import timezone
from datetime import timedelta

PLANS_PRICES = {
    'basic' : 2
}

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    objects = UserManager()

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('owner', 'Mart Owner'),
        ('admin', 'Admin'),
    )
    
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    profile_photo = models.ImageField(upload_to="profiles/", null=True, blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharFieled(max_length=6)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.full_name} - {self.id}"


class Store(models.Model):
    PLANS = (
        ('basic', 'Basic'),
    )

    PAY_DAYS = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="stores")
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="store_logo/", null=True, blank=True)
    payment_qr = models.ImageField(upload_to="payment_qr/")
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    gmap = models.CharField(max_length=255)
    upi_id = models.CharField(max_length=100)
    acc_holder_name = models.CharField(max_length=255)
    plan = models.CharField(max_length=20, choices=PLANS)
    pay_days = models.CharField(max_length=20, choices=PAY_DAYS)
    is_active = models.BooleanField(default=False)
    pincode = models.CharField(max_length=6)

    def __str__(self):
        return f"{self.name} - {self.id}"


class Product(models.Model):
    UNIT_CHOICES = (
        ('g', 'Gram'),
        ('kg', 'Kilogram'),
        ('ml', 'Milliliter'),
        ('l', 'Liter'),
        ('cm', 'Centimeter'),
        ('m', 'Meter'),
        ('inch', 'Inch'),
        ('unit', 'Unit/Piece'),
    )

    name = models.CharField(max_length=255)
    photo = models.ImageField(upload_to="products/")
    expiry = models.DateField(null=True, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='unit')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField()
    product_qr = models.ImageField(upload_to="product_qr/", null=True, blank=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="products")

    def __str__(self):
        return f"{self.name} - {self.id}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="carts")

    class Meta:
        unique_together = ('user', 'store')

    def __str__(self):
        return f"{self.user.full_name} Cart"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.product.name} x {self.qty}"
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=20)
        super().save(*args, **kwargs)


class Order(models.Model):
    order_qr = models.ImageField(upload_to="order_qr/")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="orders")
    date = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.IntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.qty}"


class AmountGenerated(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    )

    date = models.DateTimeField(auto_now_add=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="generated_amounts")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.store.name} - {self.amount}"