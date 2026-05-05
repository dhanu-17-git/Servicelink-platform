# ServiceLink Frontend - Developer Instructions

This folder contains the "Upgraded" frontend for the ServiceLink marketplace project. It has been separated from the backend to allow for modular integration and clean UI development.

## 🚀 Tech Stack
- **Framework:** [React 18](https://reactjs.org/) (Vite Build Tool)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router Dom v6](https://reactrouter.com/)
- **State Management:** React Context API (`AuthContext`, `CartContext`)

## 📂 Project Structure
- `src/pages/`: Contains main view components (Home, Services, Tools, Login, Dashboard, etc.).
- `src/components/`: Reusable UI elements like `Navbar`, `Footer`, and `ProtectedRoute`.
- `src/context/`: Global state providers for Authentication and Shopping Cart logic.
- `src/data/`: Static data used for rendering UI components.
- `public/` & `images/`: Stores all visual assets, logos, and product photography.

## 🛠️ How to Build & Run
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

## 🔌 Backend Integration
The frontend is configured to communicate with a backend API at:
`http://localhost:8000/api`

Key endpoints used:
- `/auth/profile`: For token verification.
- `/auth/login` & `/auth/register`: Authentication flow.
- (Refer to `src/context/AuthContext.jsx` for implementation details).

## 💡 Notes for AI Agents
- **Routing:** All routes are defined in `src/App.jsx`. Protected routes require a valid token in `localStorage`.
- **Styling:** Tailwind configuration is in `tailwind.config.js`. Global styles are in `src/index.css`.
- **Assets:** Most images are stored in the `/images` folder at the root of the frontend directory.
- **Modularity:** This frontend is designed to be drop-in compatible with a RESTful backend that follows the established API patterns.
