# Mobile-Adda Backend API — Module 1: Foundation & Architecture

Mobile-Adda is a Mobile Shop Management & Customer Interaction Web Application. This repository contains the backend API service built as a **Modular Monolith** using **Node.js, Express.js, TypeScript/JavaScript, PostgreSQL (Neon), and Prisma ORM**.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (>= 18.0.0)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL / Neon PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt, JWT (JSON Web Tokens)
- **Logging**: Morgan
- **Documentation**: Swagger UI / OpenAPI 3.0
- **Deployment Compatibility**: Render / Cloud VPS

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # PrismaClient singleton & DB health check
│   │   ├── env.js           # Environment variable validation via Zod
│   │   └── swagger.js       # Swagger/OpenAPI setup
│   ├── controllers/
│   │   └── health.controller.js  # Health check handler
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT Bearer token authentication
│   │   ├── role.middleware.js    # Role authorization (SUPER_ADMIN, CUSTOMER)
│   │   ├── error.middleware.js   # Centralized error handler
│   │   ├── validation.middleware.js # Zod schema validation
│   │   └── upload.middleware.js  # Image upload validation helper
│   ├── routes/
│   │   └── index.js         # API v1 router mounting /health
│   ├── utils/
│   │   ├── constants.js     # System roles, HTTP status & error codes
│   │   ├── jwt.js           # JWT sign & verify
│   │   ├── password.js      # bcrypt hash & compare
│   │   ├── pagination.js    # Query pagination helper
│   │   └── response.js      # Standardized API response formatters
│   ├── validators/
│   │   └── index.js         # Base Zod query & param schemas
│   ├── app.js               # Express application initialization
│   └── server.js            # Server entry point & graceful shutdown
├── prisma/
│   └── schema.prisma        # Prisma schema file
├── uploads/                 # Storage folder for uploaded images
├── .env                     # Local environment configuration
├── .env.example             # Environment template
├── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and adjust the variables as required:

```bash
cp .env.example .env
```

Ensure your `DATABASE_URL` is set to a valid PostgreSQL instance (e.g. Neon PostgreSQL).

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations (When DB is connected)

```bash
npx prisma migrate dev
```

---

## 💻 Available Scripts

- `npm run dev`: Start backend in development mode with nodemon auto-reloading
- `npm start`: Start backend in production mode
- `npm run build`: Generate Prisma client for deployment builds
- `npm run prisma:generate`: Re-generate Prisma Client
- `npm run prisma:migrate`: Apply database migrations in dev environment

---

## 📡 Core API Endpoints

### 1. System Health Check
- **URL**: `GET /api/v1/health`
- **Response**:
```json
{
  "success": true,
  "message": "Mobile-Adda backend is running",
  "status": "UP"
}
```

### 2. API Documentation (Swagger)
- **URL**: `http://localhost:5000/api/docs`
- Interactive OpenAPI 3.0 specification covering all endpoints, parameters, authentication schemes, and responses.

---

## 🔒 Security Specifications

- **Headers**: Secured with Helmet HTTP headers.
- **CORS**: Configured origin protection (`CLIENT_URL`).
- **Passwords**: Hashed with bcrypt (SALT_ROUNDS = 10).
- **JWT Authentication**: Secured Bearer tokens signed with `JWT_SECRET`.
- **Validation**: Strict boundary validation on `body`, `params`, `query` using Zod schemas.

---

## ☁️ Cloud Deployment (Render)

Render Build Command:
```bash
npm install && npx prisma generate
```

Render Start Command:
```bash
npm start
```
