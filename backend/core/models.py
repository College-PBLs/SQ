from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from core.utils import *
from django.utils.text import slugify

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
        ('guard', 'Guard'),
    )
    
    username = None
    email = models.EmailField(unique=True)
    temp_pass = models.CharField(max_length=128, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    profile_photo = models.ImageField(upload_to=profile_photo_path, null=True, blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)

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

    slug = models.SlugField(unique=True, blank=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="stores")
    store_name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to=store_logo_path, null=True, blank=True)
    payment_qr = models.ImageField(upload_to=store_payment_qr_path)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    gmap = models.CharField(max_length=255)
    upi_id = models.CharField(max_length=100)
    acc_holder_name = models.CharField(max_length=255)
    plan = models.CharField(max_length=20, choices=PLANS)
    pay_days = models.CharField(max_length=20, choices=PAY_DAYS)
    is_active = models.BooleanField(default=False)
    pincode = models.CharField(max_length=6)

    def __str__(self):
        return f"{self.store_name} - {self.id}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.store_name)
            slug = base_slug
            counter = 1
            while Store.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Guard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="guard")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="guards")

    def __str__(self):
        return f"{self.user.full_name} - {self.store.store_name}"


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
    photo = models.ImageField(upload_to=product_image_path, null=True, blank=True)
    expiry = models.DateField(null=True, blank=True)
    value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='unit')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField()
    product_number = models.CharField(max_length=20, unique=True)
    product_qr = models.ImageField(upload_to=product_qr_path, null=True, blank=True)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="products")

    def __str__(self):
        return f"{self.name} - {self.id}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="carts")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="carts")

    class Meta:
        unique_together = ('user', 'store')


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    qty = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)


class Order(models.Model):
    order_number = models.CharField(max_length=20, unique=True)
    order_qr = models.ImageField(upload_to=order_qr_path)
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
        return f"{self.store.store_name} - {self.amount}"