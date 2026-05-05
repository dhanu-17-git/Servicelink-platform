# Labourgrid (ServiceLink) 🛠️

**Labourgrid** is a premium, next-generation web application designed to bridge the gap between skilled blue-collar workers and customers needing local services or tool rentals. It acts as a dual-sided marketplace, offering a massive suite of features to ensure a seamless booking, tracking, and management experience.

![Platform Type](https://img.shields.io/badge/Platform-Marketplace-blue.svg)
![Frontend Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-emerald.svg)
![Backend Stack](https://img.shields.io/badge/Backend-Django%20REST-red.svg)

---

## 🌟 Key Features

### For Customers
- **Futuristic Booking Checkout:** A 3-step e-commerce style wizard (Schedule ➔ Address ➔ Payment) with dynamic pricing algorithms.
- **Hierarchical Service Filtering:** Intelligently cascaded service categories (e.g., Electrician ➔ AC Technician, Plumber ➔ Pipe Fitting).
- **Tool & Equipment Rentals:** Rent specialized tools alongside hiring professionals.
- **Premium User Dashboard:** A robust hub tracking live jobs, past bookings, expenditure, and a digital Wallet system.
- **Dynamic Worker Profiles:** View localized worker portfolios, ratings, and instant availability.

### For Workers / Partners
- **Agentic Partner Hub:** A complete CRM for workers to track jobs, accept/reject requests, and utilize GPS navigation integrations.
- **Performance Insights:** Real-time analytics on earnings, profile views, and rating trends.
- **Calendar & Shift Management:** Block out busy days or set preferred active working hours.
- **Secure ID Verification:** Interface for workers to upload Aadhaar, PAN, and trade certificates for verified status.

---

## 💻 Tech Stack

### Frontend (`/servicelink_v2`)
- **Core:** React.js powered by Vite for lightning-fast HMR and building.
- **Styling:** Tailwind CSS (with highly customized utility classes, glassmorphism, and premium UI tokens).
- **Icons:** Lucide React for consistent, crisp SVG iconography.
- **State/Routing:** React Router DOM and React Context API (`AuthContext`, `CartContext`, `NotificationContext`).

### Backend (`/servicelink_backend`)
- **Core:** Python & Django.
- **API Architecture:** Django REST Framework (DRF) handling JSON serialization and endpoint routing.
- **Database:** SQLite (development default) / Easily migratable to PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens) for secure, stateless user/worker sessions.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Git

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd servicelink_backend

# Create and activate a virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```
*The backend will now be running on `http://localhost:8000`*

### 2. Frontend Setup
Open a **new** terminal window and set up the React app:
```bash
cd servicelink_v2

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will now be running on `http://localhost:5173`*

---

## 🔒 Session Isolation note
The application utilizes `sessionStorage` for core Authentication handling. This allows developers and QA testers to open **multiple tabs on the same browser** and log in as a Customer in Tab 1, and a Worker in Tab 2, without sessions conflicting.

---

## 📁 Repository Structure

```text
Labourgrid/
├── servicelink_v2/             # Frontend React Application
│   ├── src/
│   │   ├── api/                # Axios/Fetch config and DRF endpoints
│   │   ├── components/         # Reusable UI elements (Navbars, Cards, Modals)
│   │   ├── context/            # Global State (Auth, Cart)
│   │   ├── data/               # Local Dummy Data for UI mocks
│   │   └── pages/              # Core Application Views (Dashboards, Checkout)
│   └── tailwind.config.js      # Custom theme, animations, and color palettes
│
└── servicelink_backend/        # Backend Django Application
    ├── manage.py
    └── servicelink/            # Core settings, urls, and WSGI/ASGI
```

---

## 📜 License
This project is for educational and demonstrative purposes (DBMS Project). All rights reserved by the contributors.
