# AI Agent Setup Guide & Project Instructions
**Project:** ServiceLink 
**Goal:** Prevent common cloning, configuration, and database errors when new developers (or AI agents) initialize this project.

> [!IMPORTANT]
> **Dear AI Agent:** Please read this entire document before attempting to run commands, install dependencies, or modify configuration files. This document details the specific environmental quirks of this repository.

## 1. Project Structure
The repository is split into two separate directories:
* `/servicelink_backend/` - Django REST Framework backend.
* `/servicelink_frontend/` - React (Vite) frontend.

**Rule:** Always ensure you are executing terminal commands in the correct working directory. Do not run `npm` commands in the backend or `manage.py` in the frontend.

## 2. Database Configuration (CRITICAL)
**Mistake to Avoid:** This project uses **MySQL**, NOT SQLite. When cloning, Django's default fallback behavior might generate an empty `db.sqlite3` file or prompt you to use it. **Ignore SQLite.**

### MySQL Setup
1. Ensure the local MySQL Server is running (port 3306).
2. The target database name is **`servicelink`** (Do NOT use `labourgrid`).
3. You can create the database by running `python setup_mysql.py` inside the backend folder, which will attempt to connect using standard credentials and create the `servicelink` database.

### `.env` File Requirement
You must create a `.env` file at the root of the project (copy from `.env.example`).
**The `.env` file MUST contain this exact DATABASE_URL format:**
```env
DATABASE_URL=mysql+pymysql://<user>:<password>@127.0.0.1:3306/servicelink
```
*(Example: `mysql+pymysql://root:Dhanu@123@127.0.0.1:3306/servicelink`)*

## 3. Backend Setup (/servicelink_backend)
1. Navigate to the backend: `cd servicelink_backend`
2. Set up the virtual environment (if requested by the user).
3. Install dependencies: `pip install -r requirements.txt` (or sync using `uv` if applicable).
4. Run migrations strictly to MySQL: `python manage.py migrate`
5. **Seeding Data:** 
   - To populate dummy tools: `python manage.py shell < seed_tools.py` (or execute via `Get-Content` in PowerShell).
   - To populate full user data: `python seed_data.py`
6. Start server: `python manage.py runserver` (Defaults to `localhost:8000`)

## 4. Frontend Setup (/servicelink_frontend)
1. Navigate to the frontend: `cd servicelink_frontend`
2. Install dependencies: `npm install`
3. The frontend relies on the backend running at `http://localhost:8000/api`. This is automatically handled by the `VITE_API_BASE_URL` logic inside `src/api/config.js`.
4. Start development server: `npm run dev`

## 5. Known Gotchas & Version Syncing
* **Docker Compose:** If you run `docker-compose up`, ensure that `MYSQL_ROOT_PASSWORD` in the `.env` file strictly matches the password defined in the `DATABASE_URL`. If they mismatch, the Django container will crash trying to connect to the MySQL container.
* **Location APIs:** The `Tools.jsx` frontend component uses browser Geolocation to mock user locations.
* **Authentication:** The project uses JWT tokens. If API requests fail with 401 Unauthorized, advise the user to log out and log back in to refresh their `sessionStorage`.

---
*By following this guide, you will avoid the common pitfalls of falling back to SQLite, misnaming the database, or desyncing frontend/backend environment variables.*
