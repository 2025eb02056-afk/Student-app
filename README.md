# 🎓 CampusBite — AI-Powered Student Food Delivery Platform

CampusBite is a full-stack, production-grade food delivery web application tailored for college students, campus dining spots, and dorm deliveries. Designed strictly according to the **Stitch Campus Eats** design system (`stitch_campus_eats_delivery`) and integrated with **Firebase Google Authentication**, **Gemini AI Meal Advisory**, and **PostgreSQL**.

---

## 🚀 Key Features

### 1. 🍔 Campus-First Student Discovery & Ordering
- **Campus Drop Spot Filter**: Instant filtering across *North Quad Dorms*, *Maple Hall*, *Sci Library 3rd Flr*, *Student Union Plaza*, and *Engineering Lab Wing*.
- **Pocket-Friendly Pricing**: Highlighted "Under ₹100" student meals, late-night cram session combos, and daily discounts.
- **Dynamic Food Customizer**: Customize spice levels (*Mild, Medium, Quad Fire*), add extra cheese, and leave special dorm delivery notes.
- **Group Cart & Roommate Split**: Collaborative dorm carts with dynamic split-bill math and one-click shareable links.

### 2. 🔐 Google Authentication & Firebase Integration
- **Firebase Auth**: Configured with Google Sign-In (`GoogleAuthProvider` + `signInWithPopup`) and Firebase Analytics.
- **Seamless Account Creation**: Automatically creates or links student accounts in the database, provisions a personal cart, and issues JWT tokens.
- **1-Click Instant Demo Logins**: Dedicated buttons for instant switching between **Student**, **Vendor**, and **Admin** test profiles.

### 3. 🤖 AI-Powered Food Advisor (Google Gemini)
- Server-side integration with `@google/genai` (Gemini model).
- Strict database anchoring: AI is grounded exclusively on verified menu items from real campus vendors.
- Allows students to find meals within their exact pocket budget (e.g., "Under ₹100 veg lunch").

### 4. 🗺️ Live Campus Order Tracker
- Interactive vector blueprint campus map showing dorm quads and pathways.
- Dynamic delivery progress: *Order Placed* ➔ *Canteen Preparing* ➔ *Quad Runner On The Way* ➔ *Arrived at Dorm Drop Spot*.
- Estimated delivery timer and courier contact details.

### 5. 🧑‍🍳 Vendor & Admin Dashboard
- Vendor catalog and item availability toggles.
- Real-time order status updates and queue management.
- Live analytics: Daily campus revenue, order volume, and active student delivery trends.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 18 + TypeScript + Vite
  - Tailwind CSS with Stitch Campus Eats theme tokens (`#ff6d00` primary, `#006c49` tertiary, `#0f172a` deep surface)
  - Google Fonts: *Plus Jakarta Sans* & *Inter*, with *Material Symbols Outlined*
  - Firebase Web SDK (Auth & Analytics)
  - React Router v6

- **Backend**:
  - Node.js + Express + TypeScript
  - PostgreSQL Relational Database Schema (`database/migrations/001_initial_schema.sql`)
  - Embedded zero-config Relational Store (`server/src/db/memory-store.ts`) for instant out-of-the-box local development & grading
  - JWT Authentication + bcryptjs password hashing
  - Zod request validation
  - Google Gemini API (`@google/genai`)

---

## 📦 Project Structure

```
food-delivery/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/        # Layout, Food customizer, AI modal, Campus map
│   │   ├── context/           # AuthContext (Google Auth), CartContext
│   │   ├── pages/             # Home, Food, Vendors, Cart, Checkout, Tracker, Admin, etc.
│   │   ├── services/          # api.ts, firebase.ts (Firebase Auth & Analytics)
│   │   └── App.tsx            # Routes and layout shell
│   ├── tailwind.config.js     # Stitch Campus Eats color tokens & spacing
│   └── vite.config.ts         # Vite proxy to backend port 5000
├── server/                     # Express Backend
│   ├── src/
│   │   ├── db/                # PostgreSQL pool & memory store dispatcher
│   │   ├── routes/            # auth, vendor, menu, cart, order, ai, admin
│   │   ├── services/          # Business logic services
│   │   └── index.ts           # Server entrypoint
├── database/                   # Database scripts
│   ├── migrations/            # 001_initial_schema.sql (PostgreSQL schema)
│   └── seed.sql               # Seed vendors, categories, meals, demo users
└── shared/                     # Shared TypeScript types and Zod schemas
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
PORT=5000
JWT_SECRET=campus_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: Set DATABASE_URL if connecting to an external PostgreSQL instance
# DATABASE_URL=postgresql://postgres:password@localhost:5432/campusbites
```

### 3. Run the Development Environment
Start both the backend server and frontend client:
```bash
# Start backend API (runs on http://localhost:5000)
npm --prefix server run dev

# Start frontend Vite client (runs on http://127.0.0.1:5173)
npm --prefix client run dev
```

Visit **`http://127.0.0.1:5173`** in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Or Use |
| :--- | :--- | :--- | :--- |
| **Student** | `arjun.sharma@campusbites.edu` | `Student123!` | ⚡ 1-Click Demo / Google Sign-In |
| **Vendor** | `canteen@campusbites.edu` | `Student123!` | ⚡ 1-Click Demo |
| **Admin** | `admin@campusbites.edu` | `Admin123!` | ⚡ 1-Click Demo |

---

## 🔥 Firebase & Cloud Firestore Notes
- The Firebase configuration is initialized in `client/src/services/firebase.ts` under project `studentfood-app`.
- **Google Sign-In**: Uses standard popup flow (`signInWithPopup`). Ensure `localhost` and `127.0.0.1` are listed under **Authorized domains** in the Firebase Console (Authentication > Settings > Authorized domains).
- **Firestore Collections ("Tables")**:
  - Automatically provisions and creates collections on app startup:
    - `users`: Student & admin profiles
    - `orders`: Campus orders with real-time tracking
    - `vendors`: Campus restaurants & dining spots
    - `menu_items`: Food dishes, prices, and combos
    - `categories`: Meal categories
    - `carts`: Active group/dorm carts
  - To ensure writes succeed, set your **Firestore Rules** in Firebase Console (*Firestore Database > Rules*):
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```
  - You can also manually trigger a full Firestore sync anytime by clicking **"Sync Firestore"** in the **Admin Dashboard (`/admin`)**.
"# Student-app" 
