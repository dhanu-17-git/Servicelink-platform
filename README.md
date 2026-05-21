# ServiceLink - Premium Marketplace Platform 🛠️

[![CI](https://github.com/dhanu-17-git/DBMS-PROJECT/actions/workflows/ci.yml/badge.svg)](https://github.com/dhanu-17-git/DBMS-PROJECT/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/django-%23092E20.svg?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
![Python Version](https://img.shields.io/badge/python-3.12+-blue.svg)
![Node Version](https://img.shields.io/badge/node-18+-green.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ServiceLink** is a production-ready, dual-sided marketplace platform bridging skilled blue-collar workers with customers needing local services and tool rentals. Built with modern full-stack architecture, containerized deployment, and enterprise-grade security.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [API Architecture](#api-architecture)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Demo Credentials](#demo-credentials)
- [License](#license)

---

## Overview

ServiceLink revolutionizes the way blue-collar services and equipment rentals are booked. The platform provides:

✅ **For Customers:** Seamless booking experience with smart filtering, secure payments, and real-time tracking  
✅ **For Workers:** Complete CRM with job management, performance analytics, and certification verification  
✅ **For Administrators:** Comprehensive dashboards for platform oversight, user management, and analytics  

The system is built with a layered architecture ensuring scalability, maintainability, and high performance.

---

## System Architecture

### Full-Stack Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS/HTTP
                       ▼
┌─────────────────────────────────────────────────────────┐
│          FRONTEND - React + TypeScript                  │
│          (servicelink_frontend/) PORT 5173 → 80 (nginx) │
├─────────────────────────────────────────────────────────┤
│ • 50+ React components with Tailwind CSS               │
│ • React Router for client-side routing                  │
│ • Context API for state management                      │
│ • Vite for fast HMR and optimized builds               │
│ • Nginx reverse proxy in production                     │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
                       │ /api/*
                       ▼
┌─────────────────────────────────────────────────────────┐
│      BACKEND - Django REST Framework                    │
│      (servicelink_backend/) PORT 8000                   │
├─────────────────────────────────────────────────────────┤
│ • Django 5.2.7 with DRF (Django REST Framework)       │
│ • 4 Django Apps: accounts, workers, tools, bookings    │
│ • JWT Authentication (SimpleJWT)                        │
│ • 15+ RESTful API endpoints                            │
│ • Custom User Model with role-based access             │
│ • Gunicorn WSGI application server                     │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│           DATABASE - MySQL 8.4                          │
│           (docker service) PORT 3306                    │
├─────────────────────────────────────────────────────────┤
│ • servicelink database (utf8mb4)                        │
│ • 5 core tables: User, Worker, Tool, Booking, Review   │
│ • Persistent volumes for data durability               │
│ • Health checks for availability                       │
└─────────────────────────────────────────────────────────┘
```

### Application Layering

```
Request Flow:
  Browser → Nginx (reverse proxy)
    → Frontend (React/Vite)
      → Backend (Django REST API)
        → Service Layer (Business Logic)
          → Repository/Serializer Layer (Data Access)
            → Models (ORM)
              → MySQL Database
```

---

## 🌟 Key Features

### For Customers
- ✨ **Intuitive Booking Wizard** - 3-step checkout (Schedule → Address → Payment)
- 🔍 **Smart Service Discovery** - Hierarchical filtering (Electrician → AC Technician)
- 🛠️ **Tool Rentals** - Browse and rent equipment alongside hiring professionals
- 📊 **Advanced Dashboard** - Track live jobs, past bookings, spending, and wallet balance
- ⭐ **Worker Profiles** - View portfolios, ratings, availability, and certifications
- 📍 **Location-Based Search** - Find nearby workers and services
- 💳 **Secure Payments** - Integration-ready payment gateway architecture
- 🔔 **Real-time Notifications** - Job updates and status changes

### For Workers/Partners
- 💼 **Partner Hub** - Complete CRM for job management
- 📈 **Performance Analytics** - Track earnings, views, ratings, and trends
- 📅 **Shift Management** - Set availability, block busy days, manage schedules
- ✅ **ID Verification** - Upload and manage certifications (Aadhaar, PAN, trade certs)
- 💰 **Earnings Dashboard** - Real-time earnings tracking and payment history
- 📱 **Job Notifications** - Instant alerts for new job opportunities
- ⭐ **Rating System** - Build reputation through customer reviews

### For Administrators
- 👥 **User Management** - Manage customers, workers, and admin roles
- 🔍 **Platform Analytics** - Dashboard with key metrics and insights
- ⚙️ **Content Moderation** - Review flagged bookings, profiles, and reviews
- 💰 **Transaction Management** - Track revenue, commissions, and settlements
- 📋 **Reporting Tools** - Generate system-wide reports and exports

---

## 💻 Tech Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 | Component-based UI |
| **Build Tool** | Vite | Fast dev server & optimized builds |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Icons** | Lucide React | Crisp SVG icons |
| **Routing** | React Router v6 | Client-side navigation |
| **State Management** | Context API | Global state (Auth, Cart) |
| **HTTP Client** | Fetch API | Backend API communication |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Django 5.2.7 | Web application framework |
| **API** | Django REST Framework | RESTful API endpoints |
| **Database ORM** | Django ORM | Object-relational mapping |
| **Authentication** | SimpleJWT | JWT token-based auth |
| **Server** | Gunicorn | WSGI application server |
| **Database** | MySQL 8.4 | Production database |
| **Package Manager** | UV | Fast Python package management |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Container images & isolation |
| **Orchestration** | Docker Compose | Multi-container management |
| **Reverse Proxy** | Nginx | Load balancing & SSL termination |
| **Version Control** | Git | Code version management |

---

## 🚀 Quick Start

### Prerequisites
- Python v3.12+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node.js v18+
- MySQL 8.x (or use Docker)
- Docker & Docker Compose (for containerized setup)
- Git

### Option 1: Local Development (No Docker)

#### 1. Environment Setup
```bash
# From the project root
cp .env.example .env
# Edit .env and set your MySQL password and SECRET_KEY
```

#### 2. Backend Setup
```bash
cd servicelink_backend

# Install dependencies using uv (creates .venv automatically)
uv sync --frozen

# Run database migrations
uv run python manage.py migrate

# Seed demo data (workers, tools, and demo user)
uv run python seed_data.py

# Start development server
uv run python manage.py runserver
```
✅ Backend running at `http://localhost:8000`

> **Note:** If you don't have `uv` installed, you can also use pip:
> ```bash
> python -m venv .venv
> # Windows: .venv\Scripts\activate | Mac/Linux: source .venv/bin/activate
> pip install -r requirements.txt
> python manage.py migrate
> python seed_data.py
> python manage.py runserver
> ```

#### 3. Frontend Setup (New Terminal)
```bash
cd servicelink_frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start development server
npm run dev
```
✅ Frontend running at `http://localhost:5173`

### Option 2: Docker Deployment (Recommended)

```bash
# From root directory — copy and configure environment
cp .env.example .env
# Edit .env and set your passwords

# Build and start all services
docker-compose up --build

# Run migrations inside Docker
docker-compose exec backend python manage.py migrate

# Seed demo data
docker-compose exec backend python seed_data.py

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

✅ Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin

---

## 🔐 Authentication

### JWT Authentication Flow

```
┌──────────────┐
│   User       │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  POST /api/auth/register/       │
│  Email, Password, Name, Phone   │
└────────────┬────────────────────┘
             │
             ▼
    ✅ User Created
             │
             ▼
┌─────────────────────────────────┐
│  POST /api/auth/login/          │
│  Email, Password                │
└────────────┬────────────────────┘
             │
             ▼
  Backend validates credentials
             │
             ▼
┌─────────────────────────────────┐
│  Returns JWT Tokens             │
│  - access_token (short-lived)   │
│  - refresh_token (long-lived)   │
└────────────┬────────────────────┘
             │
             ▼
  Frontend stores in sessionStorage
             │
             ▼
  Include in Authorization header:
  Authorization: Bearer <access_token>
             │
             ▼
┌─────────────────────────────────┐
│  Access Protected Endpoints      │
│  (Workers, Tools, Bookings)      │
└─────────────────────────────────┘
```

### Authentication Endpoints

```http
POST   /api/auth/register/      # Create user account
POST   /api/auth/login/         # Get JWT tokens
POST   /api/auth/refresh/       # Refresh access token
GET    /api/auth/profile/       # Get current user profile
PATCH  /api/auth/profile/       # Update profile
```

---

## 📁 Project Structure

```
Labourgrid/
│
├── servicelink_frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── api/                        # API configuration & service layer
│   │   │   └── config.js              # Base URL and auth headers
│   │   ├── components/                 # Reusable React components
│   │   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── WorkerCard.jsx
│   │   │   ├── ToolCard.jsx
│   │   │   └── ProtectedRoute.jsx     # Auth-gated routes
│   │   ├── context/                    # Global state (Auth, Cart)
│   │   ├── data/                       # Static/dummy data
│   │   ├── pages/                      # Route-level components
│   │   │   ├── Home.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Tools.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── worker/                # Worker pages
│   │   ├── utils/                      # Helper functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                         # Static assets
│   ├── .env.example                    # Environment template
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── package.json
│   └── Dockerfile
│
├── servicelink_backend/                # Django REST Backend
│   ├── manage.py
│   ├── wsgi.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── servicelink/                    # Django project settings
│   │   ├── settings.py                # Django configuration
│   │   ├── urls.py                    # Root URL routing
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/                   # User authentication app
│   │   │   ├── models.py              # CustomUser model
│   │   │   ├── views.py               # Auth views & endpoints
│   │   │   ├── serializers.py         # DRF serializers
│   │   │   ├── urls.py
│   │   │   ├── managers.py            # Custom managers
│   │   │   └── migrations/
│   │   ├── workers/                    # Worker profiles app
│   │   │   ├── models.py              # Worker, Review models
│   │   │   ├── views.py               # Worker endpoints
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── tools/                      # Tool rentals app
│   │   │   ├── models.py              # Tool model
│   │   │   ├── views.py               # Tool endpoints
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   └── bookings/                   # Booking management app
│   │       ├── models.py              # Booking model
│   │       ├── views.py               # Booking endpoints
│   │       ├── serializers.py
│   │       ├── permissions.py         # Custom permissions
│   │       ├── urls.py
│   │       └── migrations/
│   └── Dockerfile
│
├── docker-compose.yml                  # Multi-container orchestration
├── .env.example                        # Environment variables template
├── package.json                        # Root package config
├── pyproject.toml                      # Python project metadata
└── README.md                           # This file
```

### Architecture: Service Layer Pattern

```
Request → URL Router
  → View (Endpoint Handler)
    → Service Layer (Business Logic)
      → Serializer (Data Validation)
        → Model (ORM)
          → Database
```

---

## 🔌 API Architecture

### RESTful Endpoints

**Authentication Endpoints** (`/api/auth/`)
```
POST   /api/auth/register/      - Create user account
POST   /api/auth/login/         - Get JWT tokens  
POST   /api/auth/refresh/       - Refresh access token
GET    /api/auth/profile/       - Get current user profile
PATCH  /api/auth/profile/       - Update profile
```

**Workers Endpoints** (`/api/workers/`)
```
GET    /api/workers/            - List workers (paginated, searchable)
GET    /api/workers/:id/        - Get worker detail
POST   /api/workers/            - Create worker profile
PATCH  /api/workers/:id/        - Update worker profile
GET    /api/workers/?skill=X    - Filter by skill
GET    /api/workers/?q=search   - Search by name
```

**Tools Endpoints** (`/api/tools/`)
```
GET    /api/tools/              - List tools (paginated, filterable)
GET    /api/tools/:id/          - Get tool detail
POST   /api/tools/              - Create tool listing
PATCH  /api/tools/:id/          - Update tool
GET    /api/tools/?category=X   - Filter by category
GET    /api/tools/?available=true - Filter availability
```

**Bookings Endpoints** (`/api/bookings/`)
```
GET    /api/bookings/           - List user's bookings
POST   /api/bookings/           - Create booking
GET    /api/bookings/:id/       - Get booking detail
PATCH  /api/bookings/:id/       - Update booking status
DELETE /api/bookings/:id/       - Cancel booking
```

### Response Format

All API responses follow standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "errors": null
}
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE accounts_user (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('customer', 'worker', 'admin'),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Workers
CREATE TABLE workers_worker (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES accounts_user,
  skills VARCHAR(500),
  hourly_rate DECIMAL(8,2),
  rating FLOAT,
  total_reviews INT,
  is_verified BOOLEAN,
  bio TEXT,
  created_at TIMESTAMP
);

-- Tools
CREATE TABLE tools_tool (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES accounts_user,
  name VARCHAR(255),
  category VARCHAR(100),
  price_per_day DECIMAL(8,2),
  available BOOLEAN,
  stock INT,
  description TEXT,
  created_at TIMESTAMP
);

-- Bookings
CREATE TABLE bookings_booking (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES accounts_user,
  worker_id UUID REFERENCES workers_worker,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  scheduled_date DATE,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Reviews
CREATE TABLE workers_review (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings_booking,
  rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP
);
```

---

## 🔒 Security Features

✅ **JWT Authentication** - Stateless, token-based user authentication  
✅ **CORS Protection** - Configured origins in Django settings  
✅ **CSRF Tokens** - CSRF protection via form/API tokens  
✅ **Password Hashing** - Django's PBKDF2 algorithm  
✅ **Role-Based Access Control** - Customer/Worker/Admin roles  
✅ **Secure Headers** - X-Frame-Options, X-Content-Type-Options  
✅ **Input Validation** - DRF serializers validate all inputs  
✅ **SQL Injection Prevention** - Django ORM parameterized queries  
✅ **Rate Limiting Ready** - Architecture supports throttling  
✅ **Environment Secrets** - Sensitive data in .env files  

---

## 📊 Database

The application uses **MySQL 8.4** for production-grade reliability:

- **UTF-8MB4 Encoding** - Full Unicode support (emojis, multilingual)
- **Persistent Volumes** - Data survives container restarts
- **Health Checks** - Automatic connectivity validation
- **Connection Pooling** - Efficient database connections
- **Migrations** - Django migrations for schema versioning

### Database Connection

```python
# In settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE', 'servicelink'),
        'USER': os.getenv('MYSQL_USER', 'servicelink_user'),
        'PASSWORD': os.getenv('MYSQL_PASSWORD'),
        'HOST': os.getenv('MYSQL_HOST', 'db'),
        'PORT': int(os.getenv('MYSQL_PORT', 3306)),
    }
}
```

---

## 🌍 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Debug mode (dev only) | `True` |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` |
| `MYSQL_DATABASE` | Database name | `servicelink` |
| `MYSQL_USER` | Database user | `servicelink_user` |
| `MYSQL_PASSWORD` | Database password | `secure_password` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `root_password` |
| `MYSQL_HOST` | Database host | `db` (Docker) / `localhost` |
| `CORS_ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Token lifetime | `60` |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_APP_ENV` | Environment | `development` |

---

## 🐳 Docker Deployment

### Build & Run

```bash
# Build all services
docker-compose build

# Start services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services

**Database Service**
```yaml
db:
  image: mysql:8.4
  ports: 3306:3306
  volumes: db_data:/var/lib/mysql
  environment:
    MYSQL_DATABASE: ${MYSQL_DATABASE}
    MYSQL_USER: ${MYSQL_USER}
    MYSQL_PASSWORD: ${MYSQL_PASSWORD}
```

**Backend Service**
```yaml
backend:
  build: ./servicelink_backend
  ports: 8000:8000
  depends_on:
    db:
      condition: service_healthy
  environment:
    MYSQL_HOST: db
```

**Frontend Service**
```yaml
frontend:
  build: ./servicelink_frontend
  ports: 5173:80
  depends_on:
    - backend
```

### Running Migrations in Docker

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## 🧪 Testing

### Run Backend Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test apps.accounts

# With verbose output
python manage.py test --verbosity=2

# Coverage report
coverage run --source='.' manage.py test
coverage report
```

### Run Frontend Tests

```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test
```

---

## 🚦 Session Isolation

The application uses `sessionStorage` for JWT token management, enabling:

✅ Multiple browser tabs with different user roles  
✅ Simultaneous customer and worker logins  
✅ No session interference between tabs  
✅ Secure per-tab token isolation  

Example:
- **Tab 1:** Login as Customer
- **Tab 2:** Login as Worker
- **Both tabs:** Function independently

---

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Dual-sided marketplace core
- ✅ JWT authentication
- ✅ Booking system
- ✅ Worker profiles

### Phase 2
- 🔄 Payment gateway integration (Stripe/Razorpay)
- 🔄 Real-time notifications (WebSocket)
- 🔄 Advanced search filters
- 🔄 Review & rating system

### Phase 3
- 📋 Mobile app (React Native/Flutter)
- 📋 AI-powered recommendations
- 📋 Map integration (Google Maps)
- 📋 Email notifications

### Phase 4
- 📋 Admin analytics dashboard
- 📋 Dispute resolution system
- 📋 Subscription plans
- 📋 Referral program

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow PEP 8 (Python) and ESLint (JavaScript) standards
- Add tests for new features
- Update documentation
- Write descriptive commit messages

---

## 👤 Demo Credentials

### Development Mode

**Customer Account** (created by `seed_data.py`)
```
Email: demo@gmail.com
Password: password123
Role: Customer
```

**Worker Account** (any seeded worker)
```
Email: arjun.patel.1@servicelink.com
Password: password123
Role: Worker
```

**Admin Account** (create via `manage.py createsuperuser`)
```
python manage.py createsuperuser
Django Admin: http://localhost:8000/admin
```

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 ServiceLink Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgements

- **React** & **Vite** - Modern frontend tooling
- **Django REST Framework** - Powerful API framework
- **Docker** - Containerization platform
- **Tailwind CSS** - Utility-first CSS framework
- **MySQL** - Reliable database system
- **Lucide React** - Beautiful icon library

---

## 📞 Support

For issues, questions, or suggestions:
- **GitHub Issues:** [Open an issue](https://github.com/)
- **Email:** support@servicelink.com
- **Documentation:** See [docs/](./Agentic-Dev-Framework-/docs/)

---

**Made with ❤️ by the ServiceLink Team**

*Last Updated: May 2026*
