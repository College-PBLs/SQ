# API Documentation

This documentation is based on:

- `core/urls.py`
- `core/api/public.py`
- `core/api/admin.py`
- `core/api/authorized.py`
- `core/api/guard.py`
- `core/api/customer.py`
- `core/api/owner.py`
- `core/serializers.py`
- `core/services.py`
- `core/models.py`
- `core/utils.py`

## Base Notes

- All endpoints below are relative to the API root where `core/urls.py` is mounted.
- Authenticated endpoints use JWT authentication from `auth/login/`.
- Success responses use HTTP `200`.
- Validation and business-rule errors use HTTP `400`.
- Permission errors use HTTP `403`.
- Missing resources use HTTP `404`.
- Unhandled exceptions use HTTP `500`.

## Common Response Formats

### Success

```json
{
  "message": "Success"
}
```

Possible success shape variants:

```json
{
  "message": "Any success message"
}
```

```json
{
  "data": {}
}
```

```json
{
  "message": "Any success message",
  "data": {}
}
```

```json
{
  "message": "Any success message",
  "key": "value"
}
```

### Validation Error

```json
{
  "message": "Any error message"
}
```

Or serializer/model validation style:

```json
{
  "error": {
    "field_name": [
      "Validation message"
    ]
  }
}
```

### Permission Denied

```json
{
  "error": "Permission Denied"
}
```

### Not Found

```json
{
  "error": "Resource not found"
}
```

### Exception

```json
{
  "exception_error": "Internal Server Error"
}
```

## Data Models Used In Responses

### User Object

From `ProfileSerializer`, the response can include:

```json
{
  "id": 1,
  "email": "user@example.com",
  "temp_pass": null,
  "full_name": "John Doe",
  "phone": "9876543210",
  "role": "customer",
  "profile_photo": "/media/profiles/1/photo.png",
  "address": "Street address",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700001"
}
```

Note:

- `password`, `is_staff`, `is_superuser`, `is_active`, `last_login` and similar auth fields are excluded.

### Store Object

From `StoreSerializer`:

```json
{
  "id": 1,
  "slug": "my-store",
  "user": 2,
  "store_name": "My Store",
  "logo": "/media/store/my-store/logo/logo.png",
  "payment_qr": "/media/store/my-store/payment_qr/qr.png",
  "address": "Store address",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700001",
  "gmap": "https://maps.google.com/...",
  "upi_id": "owner@upi",
  "acc_holder_name": "Owner Name",
  "plan": "basic",
  "pay_days": "daily",
  "is_active": false
}
```

### Guard Object

From `GuardSerializer`:

```json
{
  "id": 1,
  "user_detail": {
    "id": 7,
    "email": "guard@example.com",
    "full_name": "Guard Name",
    "phone": "9876543210",
    "role": "guard",
    "profile_photo": null,
    "address": "",
    "city": "",
    "state": "",
    "pincode": ""
  },
  "store_detail": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": true
  }
}
```

### Product Object

From `ProductSerializer`:

```json
{
  "id": 1,
  "name": "Rice",
  "photo": "/media/store/my-store/products/rice.png",
  "expiry": "2026-12-31",
  "value": "1.00",
  "unit": "kg",
  "price": "80.00",
  "qty": 20,
  "product_number": "SQPROD-ABC1234567",
  "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png",
  "store": 1
}
```

Validation rules:

- `price` must be greater than `0`
- `qty` cannot be negative

### Cart Item Object

From `CartItemSerializer`:

```json
{
  "id": 1,
  "cart": 1,
  "product": 1,
  "qty": 2,
  "price": "80.00",
  "product_detail": {
    "id": 1,
    "name": "Rice",
    "photo": "/media/store/my-store/products/rice.png",
    "expiry": "2026-12-31",
    "value": "1.00",
    "unit": "kg",
    "price": "80.00",
    "qty": 20,
    "product_number": "SQPROD-ABC1234567",
    "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png",
    "store": 1
  }
}
```

### Cart Object

From `CartSerializer`:

```json
{
  "id": 1,
  "user": 5,
  "store": 1,
  "store_detail": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": true
  },
  "items": [
    {
      "id": 1,
      "cart": 1,
      "product": 1,
      "qty": 2,
      "price": "80.00",
      "product_detail": {}
    }
  ]
}
```

### Order Item Object

From `OrderItemSerializer`:

```json
{
  "id": 1,
  "order": 1,
  "product": 1,
  "qty": 2,
  "price_at_purchase": "80.00",
  "product_detail": {
    "id": 1,
    "name": "Rice",
    "photo": "/media/store/my-store/products/rice.png",
    "expiry": "2026-12-31",
    "value": "1.00",
    "unit": "kg",
    "price": "80.00",
    "qty": 20,
    "product_number": "SQPROD-ABC1234567",
    "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png",
    "store": 1
  }
}
```

### Order Object

From `OrderSerializer`:

```json
{
  "id": 1,
  "order_number": "SQORD-1BED3476CA",
  "order_qr": "/media/orders/SQORD-1BED3476CA.png",
  "total_amount": "160.00",
  "user": 5,
  "store": 1,
  "date": "2026-03-17T10:15:00Z",
  "store_detail": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": true
  },
  "items": [
    {
      "id": 1,
      "order": 1,
      "product": 1,
      "qty": 2,
      "price_at_purchase": "80.00",
      "product_detail": {}
    }
  ]
}
```

## 1. PUBLIC APIs

Public APIs do not require authentication.

### `POST auth/login/`

Working:

- Any user can log in using `email` and `password`.
- On success, JWT refresh and access tokens are returned with the user role.

Request:

```json
{
  "email": "xyz@gmail.com",
  "password": "xyz"
}
```

Success Response:

```json
{
  "tokens": {
    "refresh": "jwt-refresh-token",
    "access": "jwt-access-token"
  },
  "role": "customer"
}
```

Error Response:

```json
{
  "message": "Invalid Credentials"
}
```

Exception Response:

```json
{
  "exception_error": "Any unexpected server error"
}
```

### `POST auth/register/`

Working:

- Registers a new customer user.
- User role is automatically set to `customer`.

Request:

```json
{
  "full_name": "XYZ",
  "phone": "9876543210",
  "email": "xyz@gmail.com",
  "password": "xyz"
}
```

Success Response:

```json
{
  "message": "Successfully Registered"
}
```

Validation Error Response:

```json
{
  "error": {
    "email": [
      "user with this email already exists."
    ]
  }
}
```

Possible field requirements from model:

- `full_name` required
- `phone` required
- `email` required and unique
- `password` required

### `POST store/create/`

Working:

- Creates a store and its owner account.
- If the owner email already exists and has role `owner`, the same user is reused.
- If the email belongs to another role, creation fails.
- New owner accounts are created as inactive until admin approval.

Request:

```json
{
  "email": "owner@gmail.com",
  "full_name": "Owner Name",
  "phone": "9876543210",
  "store_name": "My Store",
  "store_logo": "<image-file>",
  "payment_qr": "<image-file>",
  "address": "Store address",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700001",
  "gmap": "https://maps.google.com/...",
  "upi_id": "owner@upi",
  "account_holder_name": "Owner Name",
  "plan": "basic",
  "pay_days": "daily"
}
```

Required request fields inferred from code and model:

- `email`
- `full_name`
- `phone`
- `store_name`
- `payment_qr`
- `address`
- `city`
- `state`
- `pincode`
- `gmap`
- `upi_id`
- `account_holder_name`
- `plan`
- `pay_days`

Optional fields:

- `store_logo`

Success Response:

```json
{
  "message": "Store created successfully. Awaiting admin approval.",
  "store": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": false
  },
  "owner_password": "Owner@a1b2"
}
```

If the owner user already existed:

```json
{
  "message": "Store created successfully. Awaiting admin approval.",
  "store": {},
  "owner_password": null
}
```

Error Responses:

```json
{
  "message": "Owner details missing"
}
```

```json
{
  "message": "User already exists with different role"
}
```

```json
{
  "message": "Owner already has a store"
}
```

```json
{
  "error": {
    "payment_qr": [
      "No file was submitted."
    ]
  }
}
```

## 2. ADMIN APIs

These endpoints require authentication and `request.user.role == "admin"`.

### `PATCH store/<store_id>/activation/`

Working:

- Activates or deactivates a store.
- Also updates the linked owner account `is_active` status.
- Sends activation/deactivation email.

Request:

```json
{
  "action": "activate"
}
```

Allowed values:

- `activate`
- `deactivate`

Success Response:

```json
{
  "message": "Store activated successfully",
  "store_id": 1,
  "store_name": "My Store",
  "is_active": true
}
```

Error Responses:

```json
{
  "message": "Invalid action"
}
```

```json
{
  "message": "Store already active"
}
```

```json
{
  "message": "Store already inactive"
}
```

Permission Response:

```json
{
  "error": "Permission Denied"
}
```

Not Found Response:

```json
{
  "error": "Store not found"
}
```

### `GET stores/`

Working:

- Returns all stores for admin.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "my-store",
      "user": 2,
      "store_name": "My Store",
      "logo": "/media/store/my-store/logo/logo.png",
      "payment_qr": "/media/store/my-store/payment_qr/qr.png",
      "address": "Store address",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700001",
      "gmap": "https://maps.google.com/...",
      "upi_id": "owner@upi",
      "acc_holder_name": "Owner Name",
      "plan": "basic",
      "pay_days": "daily",
      "is_active": true
    }
  ]
}
```

### `GET store/<store_id>/`

Working:

- Returns a specific store by id for admin.

Success Response:

```json
{
  "data": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": true
  }
}
```

Not Found Response:

```json
{
  "error": "Store not found"
}
```

### `DELETE store/delete/<store_id>/`

Working:

- Deletes the store.
- If the owner no longer has any store, the owner user is also deleted.

Success Response:

```json
{
  "message": "Store deleted successfully"
}
```

Not Found Response:

```json
{
  "error": "Store not found"
}
```

## 3. AUTHORIZED COMMON APIs

These endpoints require authentication. Some are role-neutral, some contain role-specific restrictions.

### `GET profile/`

Working:

- Returns the logged-in user profile.
- If the user is an owner and has a store, the store data is also returned.

Success Response for customer/admin/guard:

```json
{
  "user": {
    "id": 5,
    "email": "user@example.com",
    "full_name": "User Name",
    "phone": "9876543210",
    "role": "customer",
    "profile_photo": null,
    "address": "Address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001"
  }
}
```

Success Response for owner:

```json
{
  "user": {
    "id": 2,
    "email": "owner@example.com",
    "full_name": "Owner Name",
    "phone": "9876543210",
    "role": "owner",
    "profile_photo": null,
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001"
  },
  "store": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "My Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Store address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001",
    "gmap": "https://maps.google.com/...",
    "upi_id": "owner@upi",
    "acc_holder_name": "Owner Name",
    "plan": "basic",
    "pay_days": "daily",
    "is_active": true
  }
}
```

### `PUT profile/`

Working:

- Updates the logged-in user profile.
- For owner users, the linked store address fields are also updated from user data.

Request:

```json
{
  "full_name": "Updated Name",
  "phone": "9999999999",
  "profile_photo": "<image-file>",
  "address": "New address",
  "city": "Howrah",
  "state": "West Bengal",
  "pincode": "700002"
}
```

Success Response:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "full_name": "Updated Name",
    "phone": "9999999999",
    "role": "customer",
    "profile_photo": "/media/profiles/5/photo.png",
    "address": "New address",
    "city": "Howrah",
    "state": "West Bengal",
    "pincode": "700002"
  }
}
```

Validation Error Response:

```json
{
  "error": {
    "pincode": [
      "Ensure this field has no more than 6 characters."
    ]
  }
}
```

### `DELETE profile/`

Working:

- Deletes the currently logged-in account.

Success Response:

```json
{
  "message": "Account deleted successfully"
}
```

### `POST profile/update-password/`

Working:

- Changes the current user password.
- Requires current password, new password, and confirmation password.

Request:

```json
{
  "old_password": "old-pass",
  "new_password": "new-pass",
  "confirm_password": "new-pass"
}
```

Success Response:

```json
{
  "message": "Password updated successfully"
}
```

Error Responses:

```json
{
  "message": "All password fields are required"
}
```

```json
{
  "message": "Old password is incorrect"
}
```

```json
{
  "message": "Passwords do not match"
}
```

Note:

- The code currently calls `user.temp_pass("")`, which looks like a bug because `temp_pass` is a field, not a method. If reached, this may trigger a `500` exception instead of clearing the temporary password.

### `GET store/get-product/<prod_id>/`

Working:

- Returns a single product by id.
- Allowed roles: `owner`, `customer`.

Success Response:

```json
{
  "data": {
    "id": 1,
    "name": "Rice",
    "photo": "/media/store/my-store/products/rice.png",
    "expiry": "2026-12-31",
    "value": "1.00",
    "unit": "kg",
    "price": "80.00",
    "qty": 20,
    "product_number": "SQPROD-ABC1234567",
    "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png",
    "store": 1
  }
}
```

Permission Response:

```json
{
  "error": "Permission Denied"
}
```

Not Found Response:

```json
{
  "error": "Product not found"
}
```

## 4. OWNER APIs

These endpoints require authentication and `request.user.role == "owner"`.

### `PUT store/update/`

Working:

- Updates the owner's store.
- Also syncs store location fields to owner user profile.

Request:

```json
{
  "store_name": "Updated Store",
  "logo": "<image-file>",
  "payment_qr": "<image-file>",
  "address": "Updated address",
  "city": "Howrah",
  "state": "West Bengal",
  "pincode": "700002",
  "gmap": "https://maps.google.com/...",
  "upi_id": "newowner@upi",
  "acc_holder_name": "Updated Owner",
  "plan": "basic",
  "pay_days": "weekly | daily | monthly",
  "is_active": true
}
```

Success Response:

```json
{
  "message": "Store updated successfully",
  "data": {
    "id": 1,
    "slug": "my-store",
    "user": 2,
    "store_name": "Updated Store",
    "logo": "/media/store/my-store/logo/logo.png",
    "payment_qr": "/media/store/my-store/payment_qr/qr.png",
    "address": "Updated address",
    "city": "Howrah",
    "state": "West Bengal",
    "pincode": "700002",
    "gmap": "https://maps.google.com/...",
    "upi_id": "newowner@upi",
    "acc_holder_name": "Updated Owner",
    "plan": "basic",
    "pay_days": "weekly",
    "is_active": true
  }
}
```

Validation Error Response:

```json
{
  "error": {
    "plan": [
      "\"premium\" is not a valid choice."
    ]
  }
}
```

### `GET store/products/`

Working:

- Returns all products belonging to the logged-in owner's store.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Rice",
      "photo": "/media/store/my-store/products/rice.png",
      "expiry": "2026-12-31",
      "value": "1.00",
      "unit": "kg",
      "price": "80.00",
      "qty": 20,
      "product_number": "SQPROD-ABC1234567",
      "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png",
      "store": 1
    }
  ]
}
```

### `POST store/products/`

Working:

- Creates a product for the owner's store.
- Generates a unique `product_number` and QR code automatically.

Request:

```json
{
  "name": "Rice",
  "photo": "<image-file>",
  "expiry": "2026-12-31",
  "value": "1.00",
  "unit": "kg | g | ml | l | cm | m | inch | unit",
  "price": "80.00",
  "qty": 20
}
```

Required request fields inferred from model and serializer:

- `name`
- `price`
- `qty`

Optional fields:

- `photo`
- `expiry`
- `value`
- `unit`

Success Response:

```json
{
  "message": "Product added successfully"
}
```

Validation Error Responses:

```json
{
  "error": {
    "price": [
      "Price must be greater than 0"
    ]
  }
}
```

```json
{
  "error": {
    "qty": [
      "Qty cannot be negative"
    ]
  }
}
```

### `PUT store/product/<prod_id>/`

Working:

- Updates a product belonging to the logged-in owner's store.

Request:

```json
{
  "name": "Premium Rice",
  "price": "90.00",
  "qty": 25
}
```

Success Response:

```json
{
  "message": "Product updated successfully"
}
```

Not Found Response:

```json
{
  "error": "Product not found"
}
```

### `DELETE store/product/<prod_id>/`

Working:

- Deletes a product belonging to the logged-in owner's store.

Success Response:

```json
{
  "message": "Product deleted successfully"
}
```

### `GET store/product/<prod_id>/get-qr/`

Working:

- Returns existing product QR URL.
- If missing, generates QR code first and then returns it.

Success Response:

```json
{
  "data": {
    "product_qr": "/media/store/my-store/products/product_qr/SQPROD-ABC1234567.png"
  }
}
```

Not Found Response:

```json
{
  "error": "Product not found"
}
```

### `GET store/orders/`

Working:

- Returns all orders for the owner's store.
- Supports optional query params `start_date` and `end_date`.
- If omitted, both default to today.

Example URL:

```text
store/orders/?start_date=2026-03-01&end_date=2026-03-17
```

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "order_number": "SQORD-1BED3476CA",
      "order_qr": "/media/orders/SQORD-1BED3476CA.png",
      "total_amount": "160.00",
      "user": {
        "id": 5,
        "email": "customer@example.com",
        "full_name": "Customer Name",
        "phone": "9876543210",
        "role": "customer",
        "profile_photo": null,
        "address": "Customer address",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700001"
      },
      "store": 1,
      "date": "2026-03-17T10:15:00Z",
      "items": [
        {
          "id": 1,
          "order": 1,
          "product": 1,
          "qty": 2,
          "price_at_purchase": "80.00",
          "product_detail": {}
        }
      ]
    }
  ]
}
```

### `GET store/order/<order_id>/`

Working:

- Returns one order belonging to the owner's store.

Success Response:

```json
{
  "data": {
    "id": 1,
    "order_number": "SQORD-1BED3476CA",
    "order_qr": "/media/orders/SQORD-1BED3476CA.png",
    "total_amount": "160.00",
    "user": {
      "id": 5,
      "email": "customer@example.com",
      "full_name": "Customer Name",
      "phone": "9876543210",
      "role": "customer",
      "profile_photo": null,
      "address": "Customer address",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700001"
    },
    "store": 1,
    "date": "2026-03-17T10:15:00Z",
    "items": [
      {
        "id": 1,
        "order": 1,
        "product": 1,
        "qty": 2,
        "price_at_purchase": "80.00",
        "product_detail": {}
      }
    ]
  }
}
```

### `DELETE store/order/<order_id>/`

Working:

- Deletes an order belonging to the owner's store.

Success Response:

```json
{
  "message": "Order deleted successfully"
}
```

Not Found Response:

```json
{
  "error": "Order not found"
}
```

### `GET store/guards/`

Working:

- Returns all guards assigned to the logged-in owner's store.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "user_detail": {
        "id": 7,
        "email": "guard@example.com",
        "full_name": "Guard Name",
        "phone": "9876543210",
        "role": "guard",
        "profile_photo": null,
        "address": "",
        "city": "",
        "state": "",
        "pincode": ""
      },
      "store_detail": {
        "id": 1,
        "slug": "my-store",
        "user": 2,
        "store_name": "My Store",
        "logo": "/media/store/my-store/logo/logo.png",
        "payment_qr": "/media/store/my-store/payment_qr/qr.png",
        "address": "Store address",
        "city": "Kolkata",
        "state": "West Bengal",
        "pincode": "700001",
        "gmap": "https://maps.google.com/...",
        "upi_id": "owner@upi",
        "acc_holder_name": "Owner Name",
        "plan": "basic",
        "pay_days": "daily",
        "is_active": true
      }
    }
  ]
}
```

Possible Exception Response:

```json
{
  "exception_error": "Store not found"
}
```

### `GET store/guard/<guard_id>/`

Working:

- Returns one guard assigned to the logged-in owner's store.

Success Response:

```json
{
  "data": {
    "id": 1,
    "user_detail": {
      "id": 7,
      "email": "guard@example.com",
      "full_name": "Guard Name",
      "phone": "9876543210",
      "role": "guard",
      "profile_photo": null,
      "address": "",
      "city": "",
      "state": "",
      "pincode": ""
    },
    "store_detail": {
      "id": 1,
      "slug": "my-store",
      "user": 2,
      "store_name": "My Store",
      "logo": "/media/store/my-store/logo/logo.png",
      "payment_qr": "/media/store/my-store/payment_qr/qr.png",
      "address": "Store address",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700001",
      "gmap": "https://maps.google.com/...",
      "upi_id": "owner@upi",
      "acc_holder_name": "Owner Name",
      "plan": "basic",
      "pay_days": "daily",
      "is_active": true
    }
  }
}
```

Not Found Response:

```json
{
  "error": "Guard not found"
}
```

### `POST store/guards/`

Working:

- Creates a new user with role `guard`.
- Assigns that guard to the logged-in owner's store.
- Generates a temporary password and emails credentials to the guard.

Request:

```json
{
  "full_name": "Guard Name",
  "email": "guard@example.com",
  "phone": "9876543210"
}
```

Required fields:

- `full_name`
- `email`
- `phone`

Success Response:

```json
{
  "message": "Guard created and assigned successfully"
}
```

Error Responses:

```json
{
  "message": "full_name, email, phone required"
}
```

```json
{
  "message": "User already exists"
}
```

Possible Exception Response:

```json
{
  "exception_error": "Store not found"
}
```

### `DELETE store/guard/<guard_id>/`

Working:

- Removes the guard assignment record for a guard belonging to the owner's store.
- The linked `User` record is not deleted here.

Success Response:

```json
{
  "message": "Guard removed"
}
```

Not Found Response:

```json
{
  "error": "Guard not found"
}
```

## 5. CUSTOMER APIs

These endpoints require authentication and `request.user.role == "customer"`.

### `POST profile/update-location/`

Working:

- Updates customer address fields.

Request:

```json
{
  "city": "Kolkata",
  "state": "West Bengal",
  "address": "Street address",
  "pincode": "700001"
}
```

Success Response:

```json
{
  "message": "Location updated successfully",
  "data": {
    "id": 5,
    "email": "customer@example.com",
    "full_name": "Customer Name",
    "phone": "9876543210",
    "role": "customer",
    "profile_photo": null,
    "address": "Street address",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700001"
  }
}
```

Error Response:

```json
{
  "message": "All location fields are required"
}
```

### `GET active-stores/`

Working:

- Returns all active stores available to customers.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "my-store",
      "user": 2,
      "store_name": "My Store",
      "logo": "/media/store/my-store/logo/logo.png",
      "payment_qr": "/media/store/my-store/payment_qr/qr.png",
      "address": "Store address",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700001",
      "gmap": "https://maps.google.com/...",
      "upi_id": "owner@upi",
      "acc_holder_name": "Owner Name",
      "plan": "basic",
      "pay_days": "daily",
      "is_active": true
    }
  ]
}
```

### `GET active-store/<store_id>/`

Working:

- Returns one active store by id.

Not Found Response:

```json
{
  "error": "Store not found"
}
```

### `GET user/carts/`

Working:

- Returns all carts for the logged-in customer.
- Since cart is unique per user and store, this usually represents one cart per store.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "user": 5,
      "store": 1,
      "store_detail": {},
      "items": [
        {
          "id": 1,
          "cart": 1,
          "product": 1,
          "qty": 2,
          "price": "80.00",
          "product_detail": {}
        }
      ]
    }
  ]
}
```

### `GET user/cart/<cart_id>/`

Working:

- Returns a specific cart owned by the logged-in customer.

Not Found Response:

```json
{
  "error": "Cart not found"
}
```

### `DELETE user/cart/<cart_id>/`

Working:

- Deletes the whole cart.
- Restores each cart item quantity back into product stock before deletion.

Success Response:

```json
{
  "message": "Cart deleted successfully"
}
```

### `POST user/cart-item/`

Working:

- Adds a product into the cart using `product_number`.
- If a cart for that store does not exist, it is created automatically.
- Product stock is reduced immediately.

Request:

```json
{
  "product_number": "SQPROD-ABC1234567",
  "qty": 2
}
```

Success Response:

```json
{
  "message": "Added to cart",
  "item_id": 1
}
```

Error Responses:

```json
{
  "message": "Product Number required"
}
```

```json
{
  "exception_error": "['Quantity must be positive']"
}
```

```json
{
  "exception_error": "['Insufficient stock']"
}
```

Not Found Response:

```json
{
  "error": "Product not found"
}
```

Note:

- Service-level `ValidationError` exceptions are not converted to `400`; they currently fall through to the generic exception handler and are returned as `500`.

### `PATCH user/cart-item/<item_id>/`

Working:

- Updates quantity of an existing cart item.
- Product stock is adjusted according to quantity change.

Request:

```json
{
  "qty": 5
}
```

Success Response:

```json
{
  "message": "Cart updated"
}
```

Error Response:

```json
{
  "message": "Qty required"
}
```

Not Found Response:

```json
{
  "error": "CartItem not found"
}
```

Possible Exception Responses:

```json
{
  "exception_error": "['Quantity must be positive']"
}
```

```json
{
  "exception_error": "['Insufficient stock']"
}
```

### `DELETE user/cart-item/<item_id>/`

Working:

- Removes one cart item.
- Restores the removed quantity to product stock.

Success Response:

```json
{
  "message": "Cart item removed"
}
```

Not Found Response:

```json
{
  "error": "CartItem not found"
}
```

### `GET user/orders/`

Working:

- Returns all orders for the logged-in customer.

Success Response:

```json
{
  "data": [
    {
      "id": 1,
      "order_number": "SQORD-1BED3476CA",
      "order_qr": "/media/orders/SQORD-1BED3476CA.png",
      "total_amount": "160.00",
      "user": 5,
      "store": 1,
      "date": "2026-03-17T10:15:00Z",
      "store_detail": {},
      "items": [
        {
          "id": 1,
          "order": 1,
          "product": 1,
          "qty": 2,
          "price_at_purchase": "80.00",
          "product_detail": {}
        }
      ]
    }
  ]
}
```

### `GET user/order/<order_id>/`

Working:

- Returns one order belonging to the logged-in customer.

Not Found Response:

```json
{
  "error": "Order not found"
}
```

### `POST user/orders/`

Working:

- Places an order for the specified active store.
- Uses all cart items of the current user for that store.
- Creates order items, computes total, generates order QR, records generated amount, and sends order confirmation email.

Request:

```json
{
  "store_id": 1
}
```

Success Response:

```json
{
  "message": "Order placed successfully",
  "order_id": 1,
  "qr": "/media/orders/SQORD-1BED3476CA.png"
}
```

Error Responses:

```json
{
  "message": "Store ID required"
}
```

```json
{
  "message": "Cart empty"
}
```

Not Found Response:

```json
{
  "error": "Store not found"
}
```

Possible Exception Response:

```json
{
  "exception_error": "['Cart is empty']"
}
```

### `GET user/order/<order_id>/qr/`

Working:

- Returns the QR image URL for a customer order.

Success Response:

```json
{
  "qr": "/media/orders/SQORD-1BED3476CA.png"
}
```

Not Found Response:

```json
{
  "error": "Order not found"
}
```

## 6. GUARD APIs

These endpoints require authentication and `request.user.role == "guard"`.

### `POST scan/order-qr/`

Working:

- Accepts an `order_number`.
- Fetches full order details including customer and order items.
- This route currently resolves to the guard-only `ScanQRView` imported from `core/api/guard.py`.

Request:

```json
{
  "order_number": "SQORD-1BED3476CA"
}
```

Success Response:

```json
{
  "data": {
    "id": 1,
    "order_number": "SQORD-1BED3476CA",
    "order_qr": "/media/orders/SQORD-1BED3476CA.png",
    "total_amount": "160.00",
    "user": {
      "id": 5,
      "email": "customer@example.com",
      "full_name": "Customer Name",
      "phone": "9876543210",
      "role": "customer",
      "profile_photo": null,
      "address": "Customer address",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700001"
    },
    "store": 1,
    "date": "2026-03-17T10:15:00Z",
    "items": [
      {
        "id": 1,
        "order": 1,
        "product": 1,
        "qty": 2,
        "price_at_purchase": "80.00",
        "product_detail": {}
      }
    ]
  }
}
```

Error Response:

```json
{
  "message": "Order number required"
}
```

Permission Response:

```json
{
  "error": "Permission Denied"
}
```

Not Found Response:

```json
{
  "error": "Order not found"
}
```

## Role Summary

### Public

- `POST auth/login/`
- `POST auth/register/`
- `POST store/create/`

### Admin

- `PATCH store/<store_id>/activation/`
- `GET stores/`
- `GET store/<store_id>/`
- `DELETE store/delete/<store_id>/`

### Any Authenticated User

- `GET profile/`
- `PUT profile/`
- `DELETE profile/`
- `POST profile/update-password/`

### Owner Or Customer

- `GET store/get-product/<prod_id>/`

### Owner

- `PUT store/update/`
- `GET store/products/`
- `POST store/products/`
- `PUT store/product/<prod_id>/`
- `DELETE store/product/<prod_id>/`
- `GET store/product/<prod_id>/get-qr/`
- `GET store/orders/`
- `GET store/order/<order_id>/`
- `DELETE store/order/<order_id>/`
- `GET store/guards/`
- `POST store/guards/`
- `GET store/guard/<guard_id>/`
- `DELETE store/guard/<guard_id>/`

### Customer

- `POST profile/update-location/`
- `GET active-stores/`
- `GET active-store/<store_id>/`
- `GET user/carts/`
- `GET user/cart/<cart_id>/`
- `DELETE user/cart/<cart_id>/`
- `POST user/cart-item/`
- `PATCH user/cart-item/<item_id>/`
- `DELETE user/cart-item/<item_id>/`
- `GET user/orders/`
- `GET user/order/<order_id>/`
- `POST user/orders/`
- `GET user/order/<order_id>/qr/`

### Guard

- `POST scan/order-qr/`

# HOW TO RUN:
STEP 1: Clone this repo in your system

STEP 2: Create the virtual environment & activate it
```bash
python -m venv venv
venv/Scripts/activate
```

STEP 3: Download all the requirements
```bash
pip install -r requirements.txt
```

STEP 4: Create a .env file and copy the content of .env.example file

STEP 5: Create a DB in PG Admin and add credentials to .env & for email you can use my credentials for which please contact me

STEP 6: Migrate the models to DB
```bash
python manage.py makemigrations
python manage.py migrate
```

STEP 7: Run server
```bash
python manage.py runserver
```

STEP 8: The server will run locally at http://127.0.0.1:8000/ -> this is the base url for frontend (act as backend url)
