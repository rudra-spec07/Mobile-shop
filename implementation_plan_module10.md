# Implementation Plan - Backend DLD Module 10: Security, Audit, API Documentation & Deployment

## 1. Existing Implementation
- **JWT Security**: Signed with `env.JWT_SECRET`, 1-day expiration, minimal payload (`id`, `email`, `role`), verified by `auth.middleware.js`. No passwords or secrets stored in tokens.
- **Password Security**: Managed via `bcryptjs` with 10 salt rounds (`password.js`). Password hashes are excluded from JSON responses.
- **Authorization / RBAC**: Enforced at backend middleware level via `role.middleware.js` using `authorizeRoles('SUPER_ADMIN')` for administrative endpoints.
- **CORS Configuration**: Configured in `app.js` with dynamic origin whitelist (`CLIENT_URL`, `localhost`, `.onrender.com`).
- **Helmet Security Headers**: Mounted in `app.js` with conservative `crossOriginResourcePolicy`.
- **Body Size Limit**: Configured in `app.js` (`express.json({ limit: '10mb' })`).
- **API Versioning**: Prefix `/api/v1` used across all domain routes.
- **Global Error Handler**: `error.middleware.js` safely catches Zod errors, Prisma error codes (`P2002`, `P2025`), JWT errors, and suppresses internal stack traces in production.
- **File Upload Security**: `upload.middleware.js` restricts upload MIME types to JPEG, PNG, WEBP and limits size to 5MB.
- **Environment Security**: `.env` is ignored in `.gitignore`, `.env.example` contains safe placeholders only.
- **Basic Health Endpoint**: `GET /api/v1/health` exists and returns `{ success: true, message: '...', status: 'UP' }`.
- **Swagger Documentation**: Mounted at `/api/docs` and `/api/docs.json` via `swagger.js`.

---

## 2. Missing Implementation
- **Rate Limiting Middleware**: Missing rate limiting for sensitive authentication endpoints (`POST /api/v1/auth/login`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`).
- **Audit Logging System**:
  - Missing `AuditLog` model in `prisma/schema.prisma`.
  - Missing audit service to record administrative actions (`USER_STATUS_CHANGE`, `MOBILE_CREATE`, `MOBILE_UPDATE`, `BRAND_CREATE`, `BRAND_UPDATE`, `PART_CREATE`, `STOCK_IN`, `STOCK_OUT`, `STOCK_ADJUSTMENT`, `ENQUIRY_RESPONSE`, `REQUEST_STATUS_CHANGE`).
- **Database Health Endpoint**: Missing `GET /api/v1/health/database` to verify database connectivity.
- **Request ID Middleware**: Missing `X-Request-ID` correlation header handling in incoming requests and response headers.
- **Swagger Endpoint Alias**: Missing alias redirect for `/api-docs` (standard OpenAPI UI path).

---

## 3. Partially Implemented Functionality
- **Health Checks**: Standard health check exists (`/api/v1/health`), but needs expansion for `/api/v1/health/database`.
- **Swagger UI**: Exists at `/api/docs`, missing `/api-docs` route alias.
- **Logging**: Express request logging exists via `morgan`, but lacks `X-Request-ID` trace headers.

---

## 4. Requirement Classification

| Requirement | Classification | Description / Action |
| --- | --- | --- |
| JWT Security | ALREADY COMPLETE | Verified minimal claims, expiration, secret from env. |
| Password Security | ALREADY COMPLETE | Bcrypt hashing verified. |
| RBAC | ALREADY COMPLETE | Super Admin & Customer authorization enforced by middleware. |
| CORS | ALREADY COMPLETE | Dynamic origin validation active. |
| Helmet | ALREADY COMPLETE | Enabled safely. |
| Body Size Limits | ALREADY COMPLETE | Configured to 10mb. |
| Rate Limiting | MISSING | Implement lightweight in-memory rate limiter for auth endpoints. |
| Input Validation | ALREADY COMPLETE | Zod validation on all endpoints. |
| Global Error Handling | ALREADY COMPLETE | Safe Prisma & application error responses. |
| Audit Logging | MISSING / REQUIRES CAREFUL PRODUCTION CHANGE | Add additive `AuditLog` schema model and audit log service. |
| Application Logging | PARTIALLY COMPLETE | Integrate `X-Request-ID` into request logging. |
| Request ID | MISSING | Add `X-Request-ID` middleware. |
| API Versioning | ALREADY COMPLETE | `/api/v1` actively used. |
| Swagger / OpenAPI | PARTIALLY COMPLETE | Add `/api-docs` route alias & verify schemas. |
| Health Check | PARTIALLY COMPLETE | Add `GET /api/v1/health/database` endpoint. |
| Environment Security | ALREADY COMPLETE | `.env` ignored, `.env.example` safe. |
| Deployment Safety | ALREADY COMPLETE | Render config compatible. |

---

## 5. Security Risks
- Vulnerability to brute-force attacks on `POST /auth/login` and password reset routes without rate limiting.
- Lack of accountability for sensitive admin actions (stock adjustments, user deactivations) without audit logging.

---

## 6. Production Risks
- Potential database downtime or table lock if non-additive schema changes are applied.
- Breaking existing frontend API contracts if route paths or response structures are modified.

---

## 7. Database Migration Risks
- Adding `AuditLog` table to `schema.prisma` is **100% ADDITIVE**.
- No existing columns, constraints, or tables will be deleted or renamed.
- Neon database will remain untouched and safe.

---

## 8. Required Changes

1. **Database Schema (`prisma/schema.prisma`)**:
   - Add `AuditLog` model (fields: `id`, `userId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `ipAddress`, `userAgent`, `createdAt`).

2. **Middleware**:
   - Add `requestIdMiddleware` in `src/middleware/request-id.middleware.js` to attach/forward `X-Request-ID`.
   - Add `rateLimiter` in `src/middleware/rate-limit.middleware.js` to limit login and password reset requests.

3. **Audit Service (`src/services/audit.service.js`)**:
   - Create `createAuditLog` function to asynchronously capture audit entries without blocking primary business transactions.
   - Integrate audit logging into administrative controllers/services (`user.service.js`, `mobile.service.js`, `brand.service.js`, `part.service.js`, `inventory.service.js`, `enquiry.service.js`, `request.service.js`).

4. **Health Check (`src/controllers/health.controller.js` & `src/routes/index.js`)**:
   - Implement `getDatabaseHealth` controller method querying `prisma.$queryRaw\`SELECT 1\``.
   - Expose `GET /api/v1/health/database` and `GET /api/v1/health`.

5. **Swagger UI Alias (`src/config/swagger.js`)**:
   - Expose `/api-docs` alongside `/api/docs`.

---

## 9. Optional Improvements That MUST NOT Be Implemented
- Redis cache layer (in-memory works fine).
- Heavy external logging providers (e.g. Winston/Datadog).
- Changing database ORM or refactoring existing Modules 1–9 business logic.

---

## 10. Files That Will Be Modified
- `backend/prisma/schema.prisma` (additive `AuditLog` model)
- `backend/src/app.js` (mount request ID, rate limiting, swagger alias)
- `backend/src/config/swagger.js` (add `/api-docs` route alias)
- `backend/src/controllers/health.controller.js` (add database health check)
- `backend/src/routes/index.js` (mount database health check endpoint)
- `backend/src/routes/auth.routes.js` (apply rate limiter to login/forgot-password/reset-password)
- `backend/src/services/user.service.js` (trigger audit log on admin user status update)
- `backend/src/services/mobile.service.js` (trigger audit log on mobile CRUD/status change)
- `backend/src/services/brand.service.js` (trigger audit log on brand CRUD)
- `backend/src/services/part.service.js` (trigger audit log on part CRUD)
- `backend/src/services/inventory.service.js` (trigger audit log on stock-in/stock-out/adjustment)
- `backend/src/services/enquiry.service.js` (trigger audit log on enquiry response/status change)
- `backend/src/services/request.service.js` (trigger audit log on request status changes)

---

## 11. Files That Will NOT Be Modified
- `backend/src/utils/jwt.js`
- `backend/src/utils/password.js`
- `backend/src/middleware/auth.middleware.js`
- `backend/src/middleware/role.middleware.js`
- `backend/src/middleware/error.middleware.js`
- `backend/src/middleware/upload.middleware.js`
- All frontend files (`frontend/*`)

---

## 12. Regression Risks
- **Low**: All added components are either standalone middleware (`X-Request-ID`, Rate Limiting), additive schema additions (`AuditLog`), or asynchronous audit hooks that do not break main execution flows.

---

## 13. Testing Strategy
1. **Security & Rate Limit Test**: Send 10+ rapid requests to `POST /api/v1/auth/login` to confirm rate limiter returns 429 Too Many Requests after limit.
2. **Audit Logging Test**: Trigger admin actions (e.g., stock update, status change) and verify record insertion in `AuditLog`.
3. **Health Check Test**: Query `GET /api/v1/health` and `GET /api/v1/health/database`.
4. **Request ID Test**: Send request with/without `X-Request-ID` and verify header presence in HTTP response.
5. **Swagger UI Test**: Access `http://localhost:5000/api-docs` and `http://localhost:5000/api/docs`.
6. **Modules 1–9 Smoke Test**: Execute existing test scripts (`test_server_http.js`) to confirm zero regressions.
