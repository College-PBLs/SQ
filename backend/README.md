# SQ Backend

Django REST backend for a role-based smart queue and store ordering system.

The project supports:

- public customer registration and login
- store onboarding and admin approval
- owner product and order management
- customer cart and order flow
- QR-based order lookup

## Project Structure

- `backend/` Django project settings and root configuration
- `core/` main app containing models, APIs, serializers, services, and utilities
- `templates/` email templates
- `media/` uploaded files and generated QR assets
- `manage.py` Django entry point
- `requirements.txt` Python dependencies
- `API_DOCUMENTATION.md` role-based API documentation

## Roles

- `public` no authentication required
- `customer` can browse active stores, manage cart, place orders, update profile and location
- `owner` can manage store details, products, and store orders
- `admin` can activate/deactivate stores and manage store visibility

## Main Features

- JWT-based login
- customer registration
- store creation with owner account generation
- admin store activation/deactivation
- owner-side product CRUD
- customer cart management
- order placement with QR code generation
- QR-based order scan endpoint
- HTML email notifications for store activation, deactivation, and order confirmation

## Setup

### 1. Create and activate virtual environment

Windows bash:

```bash
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env` and update required values.

Typical values include:
- DB details
- email configuration
- `LOGIN_URL`
- Django secret and runtime settings used by the project

### 4. Apply migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create admin user

Use Django shell or your existing helper script:

```bash
python create_superuser.py
```

If that script is not configured for your environment, use:

```bash
python manage.py createsuperuser
```

### 6. Run development server

```bash
python manage.py runserver
```

## API Overview

The API routes are defined in `core/urls.py`.

High-level route groups:

- `auth/` login and customer registration
- `scan/` QR-based order lookup
- `store/` store creation, activation, update, product management, store orders
- `stores/` and `active-stores/` store listing APIs
- `user/` cart and order APIs for customers
- `profile/` authenticated profile APIs

Detailed endpoint documentation is available in:

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Important Models

Core data models in `core/models.py`:

- `User`
- `Store`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `AmountGenerated`

## Notes

- Product QR codes are generated when products are created or when QR is requested.
- Order QR codes are generated at checkout.
- Cart operations immediately affect product stock.
- Store activation also toggles owner account activation.

## Known Code Notes

- Password change flow in `core/api/authorized.py` appears to call `temp_pass` like a method. That should likely be a field assignment instead.
- Some service-level validation errors currently fall through to generic exception responses instead of returning structured `400` responses.

## Documentation

- API reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
