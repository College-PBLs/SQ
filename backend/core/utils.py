import os, shutil
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

def send_html_mail(subject, template, context, to_email):
    try:
        html_content = render_to_string(template, context)
        email = EmailMultiAlternatives(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    except Exception as e:
        print("MAIL ERROR:", e)

def delete_file(file_field):
    if not file_field:
        return
    file_path = file_field.path
    if os.path.isfile(file_path):
        os.remove(file_path)

def delete_folder_recursive(path):
    if os.path.isdir(path):
        shutil.rmtree(path)

def store_base_folder(store):
    return f"{store.slug}"

def store_logo_path(instance, filename):
    return f"store/{store_base_folder(instance)}/logo/{filename}"

def store_payment_qr_path(instance, filename):
    return f"store/{store_base_folder(instance)}/payment_qr/{filename}"

def product_image_path(instance, filename):
    store = instance.store
    return f"store/{store_base_folder(store)}/products/{filename}"

def product_qr_path(instance, filename):
    store = instance.store
    return f"store/{store_base_folder(store)}/products/product_qr/{filename}"

def order_qr_path(instance, filename):
    store = instance.store
    return f"orders/{filename}"

def profile_photo_path(instance, filename):
    return f"profiles/{instance.id}/{filename}"

def isAdmin(user):
    return user.role == "admin"

def isOwner(user):
    return user.role == "owner"

def isCustomer(user):
    return user.role == "customer"    

def isGuard(user):
    return user.role == "guard"


def permission_denied():
    return Response(
        {"error": "Permission Denied"},
        status=403
    )


def error(error_message=None, error_dict=None):
    response = {}
    if error_message:
        response["message"] = error_message
    if error_dict:
        response["error"] = error_dict
    if not response:
        response["error"] = "Bad Request"
    return Response(
        response,
        status=400
    )


def not_found(resource_name):
    return Response(
        {"error": f"{resource_name} not found"},
        status=404
    )


def exception(error="Internal Server Error"):
    return Response(
        {"exception_error": error},
        status=500
    )


def success(message=None, data=None, data_dict=None):
    response = {}
    if message:
        response["message"] = message
    if data is not None:
        response["data"] = data
    if data_dict:
        response.update(data_dict)
    if not response:
        response["message"] = "Success"
    return Response(
        response, status=200
    )