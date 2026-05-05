# ServiceLink Backend

Production-oriented Django REST backend for the ServiceLink marketplace.

## Folder Structure

```text
servicelink_backend/
|-- manage.py
|-- README.md
|-- requirements.txt
|-- .env.example
|-- servicelink/
|   |-- __init__.py
|   |-- asgi.py
|   |-- settings.py
|   |-- urls.py
|   `-- wsgi.py
`-- apps/
    |-- accounts/
    |   |-- admin.py
    |   |-- apps.py
    |   |-- managers.py
    |   |-- models.py
    |   |-- serializers.py
    |   |-- urls.py
    |   |-- views.py
    |   `-- migrations/
    |-- workers/
    |   |-- admin.py
    |   |-- apps.py
    |   |-- models.py
    |   |-- serializers.py
    |   |-- urls.py
    |   |-- views.py
    |   `-- migrations/
    |-- tools/
    |   |-- admin.py
    |   |-- apps.py
    |   |-- models.py
    |   |-- serializers.py
    |   |-- urls.py
    |   |-- views.py
    |   `-- migrations/
    `-- bookings/
        |-- admin.py
        |-- apps.py
        |-- models.py
        |-- permissions.py
        |-- serializers.py
        |-- urls.py
        |-- views.py
        `-- migrations/
```

## Install Commands

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `PATCH /api/auth/profile`
- `GET /api/workers`
- `GET /api/workers/<id>`
- `GET /api/tools`
- `GET /api/tools/<id>`
- `POST /api/bookings`
- `GET /api/bookings/user`
- `PATCH /api/bookings/<id>`

## Notes

- JWT auth is enabled globally through DRF.
- Worker and tool listing endpoints are public.
- Booking endpoints are restricted to the authenticated booking owner.
- Booking creation locks the selected worker or tool until the booking is completed or cancelled.
- Configure MySQL using the values in `.env.example`.
