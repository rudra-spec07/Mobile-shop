# Mobile-Adda Frontend — Module 1: Architecture, App Shell & Navigation

Mobile-Adda is a Mobile Shop Management & Customer Interaction Web Application. This directory contains the frontend web client built using **React, Vite, Tailwind CSS, Lucide Icons, and React Router DOM**.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS (Restrained design tokens & responsive utilities)
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: React Router DOM (`react-router-dom`)
- **API Client**: Axios (`axios`) with interceptors targeting `VITE_API_URL` (`http://localhost:5000/api/v1`)

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components (Button, Input, Select, Modal, Loader, Spinner, EmptyState, ErrorState, Toast, Card, Pagination)
│   │   ├── layout/         # CustomerLayout, AdminLayout, Header, Footer, Sidebar
│   │   └── navigation/     # Navbar, BottomNavigation, Breadcrumb
│   ├── context/            # AuthContext (user, token, role, login, logout)
│   ├── pages/
│   │   ├── public/         # Home landing page, Catalog & Auth placeholders
│   │   ├── customer/       # Customer Dashboard & Customer placeholders
│   │   ├── admin/          # Super Admin Dashboard & Admin placeholders
│   │   └── error/          # 404 NotFound, AccessDenied, GlobalError
│   ├── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   ├── services/           # Centralized Axios API client (api.js)
│   ├── utils/              # Roles, constants & status badges
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

### 3. Start Local Development Server

```bash
npm run dev
```

The application will run locally at `http://localhost:5173`.

### 4. Build Production Bundle

```bash
npm run build
```

---

## 📱 Navigation & Panels

### 1. Public Landing Area (`/`)
- Hero banner: "Welcome to Mobile-Adda" & "Find Mobiles & Mobile Parts Easily"
- Primary CTA buttons ("Browse Mobiles", "Browse Parts")
- Featured Mobiles & Available Parts card sections

### 2. Customer Panel (`/customer`)
- Desktop Header, Navbar, User Dropdown, and Footer
- Fixed Mobile **Bottom Navigation** (`Home`, `Mobiles`, `Parts`, `Requests`, `Profile`)
- Customer Dashboard with summary metrics & recent activity feed

### 3. Super Admin Panel (`/admin`)
- Responsive Sidebar (Persistent Desktop, Collapsible Tablet, Mobile Overlay Drawer)
- Admin Topbar with quick status & notifications
- Super Admin Dashboard with metrics grid & low stock warning feed

### 4. Route Protection & Guards
- `ProtectedRoute`: Authentication check
- `RoleRoute`: Authorization check for `SUPER_ADMIN` vs `CUSTOMER` roles
