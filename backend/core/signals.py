import os
from django.core.files.storage import default_storage
from django.conf import settings
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from core.models import User, Store, Product, Order
from core.utils import delete_file, delete_folder_recursive, store_base_folder

@receiver(pre_save, sender=User)
def delete_old_profile(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return

    if old.profile_photo and old.profile_photo != instance.profile_photo:
        delete_file(old.profile_photo)


@receiver(pre_save, sender=Store)
def delete_old_store_images(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Store.objects.get(pk=instance.pk)
    except Store.DoesNotExist:
        return

    if old.logo and old.logo != instance.logo:
        delete_file(old.logo)

    if old.payment_qr and old.payment_qr != instance.payment_qr:
        delete_file(old.payment_qr)


@receiver(pre_save, sender=Product)
def delete_old_product_images(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Product.objects.get(pk=instance.pk)
    except Product.DoesNotExist:
        return

    if old.photo and old.photo != instance.photo:
        delete_file(old.photo)

    if old.product_qr and old.product_qr != instance.product_qr:
        delete_file(old.product_qr)


@receiver(pre_save, sender=Order)
def delete_old_order_qr(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return

    if old.order_qr and old.order_qr != instance.order_qr:
        delete_file(old.order_qr)


@receiver(post_delete, sender=User)
def delete_profile_on_delete(sender, instance, **kwargs):
    delete_file(instance.profile_photo)


@receiver(post_delete, sender=Store)
def delete_store_media(sender, instance, **kwargs):
    delete_file(instance.logo)
    delete_file(instance.payment_qr)
    store_folder = os.path.join(
        settings.MEDIA_ROOT,
        "store",
        store_base_folder(instance)
    )
    delete_folder_recursive(store_folder)


@receiver(post_delete, sender=Product)
def delete_product_media(sender, instance, **kwargs):
    delete_file(instance.photo)
    delete_file(instance.product_qr)


@receiver(post_delete, sender=Order)
def delete_order_qr(sender, instance, **kwargs):
    delete_file(instance.order_qr)


@receiver(post_delete, sender=Product)
def delete_product_media(sender, instance, **kwargs):
    delete_file(instance.photo)
    delete_file(instance.product_qr)
    if instance.product_number:
        filename = f"{instance.product_number}.png"
        try:
            store_slug = instance.store.slug
            qr_path = f"store/{store_slug}/products/product_qr/{filename}"
            if default_storage.exists(qr_path):
                default_storage.delete(qr_path)

        except Exception as e:
            print("QR fallback delete error:", e)