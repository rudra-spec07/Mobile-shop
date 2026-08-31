# Implementation Plan & Requirement Mapping - Frontend DLD Module 10

## 1. Requirement Classification & Mapping

| DLD Requirement | Classification | Existing Capability / Status | Targeted Action |
| --- | --- | --- | --- |
| **M10-S01: Access Denied** | A. Already Implemented | `AccessDenied.jsx` page and `RoleRoute.jsx` exist. | Polish UX to ensure clear "Go to Dashboard" / "Go Home" actions. |
| **M10-S02: Session Expired** | B. Partially Implemented | Token removal on 401 exists in `api.js`. | Add window event dispatch on 401 to clear React `AuthContext` state and redirect to `/login` with a session expired message. |
| **M10-S03: Global Error Handling** | C. Missing and Required | `GlobalError.jsx` page exists, but no React `ErrorBoundary` wrapper. | Create `src/components/common/ErrorBoundary.jsx` and wrap application in `App.jsx`. |
| **M10-S04: API Error State** | A. Already Implemented | `ErrorState.jsx` exists in `src/components/common/`. | Retain existing component. Ensure consistent usage across load failures. |
| **M10-S05: Validation Error State** | A. Already Implemented | `Input.jsx` supports inline `error` rendering. | Retain existing component. Ensure pre-submission validation on auth/forms. |
| **API Error Normalization** | B. Partially Implemented | `api.js` response interceptor formats error messages. | Normalize HTTP status codes (400, 401, 403, 404, 409, 422, 429, 500, 503) and network failures into safe, user-friendly messages. |
| **Resource Not Found** | A. Already Implemented | `NotFound.jsx` page and wildcard `*` route exist. | Retain existing 404 page and routing. |
| **M10-S06: Service Unavailable** | C. Missing and Required | No dedicated maintenance/unavailable page. | Create `src/pages/error/ServiceUnavailable.jsx` with retry capability. |
| **Protected & Role Routes** | A. Already Implemented | `ProtectedRoute.jsx` and `RoleRoute.jsx` exist and wrap admin/customer routes. | Retain existing route protection. |
| **UI Permission Control** | A. Already Implemented | Navigation bars hide admin options for customers. | Retain existing RBAC UI controls. |
| **Sensitive Data Protection** | A. Already Implemented | Tokens in localStorage only contain minimal user info. | Retain existing clean state handling. No secrets in `VITE_*` vars. |
| **Environment Configuration** | A. Already Implemented | `VITE_API_URL` configured in `src/services/api.js`. | Retain local `http://localhost:5000/api/v1` default fallback. |
| **API Client Centralization** | A. Already Implemented | `src/services/api.js` centralized Axios instance. | Extend existing interceptor without breaking contracts. |
| **M10-S07: Audit UI** | C. Missing and Required | Backend `audit.service.js` has `getAuditLogs()`, but backend route and frontend view are missing. | 1. Expose `GET /admin/audit-logs` in backend `admin-dashboard.routes.js`. <br> 2. Create `src/services/audit.service.js` in frontend. <br> 3. Create `src/pages/admin/AdminAuditLogs.jsx` (SUPER_ADMIN only). <br> 4. Mount `/admin/audit-logs` in `AppRoutes.jsx`. |
| **Deployment Configuration** | A. Already Implemented | `vite.config.js` with SPA routing setup. | Verify `npm run build` static output. |

---

## 2. Component & File Modification Plan

### [NEW] `frontend/src/components/common/ErrorBoundary.jsx`
- Class component implementing `componentDidCatch` and `getDerivedStateFromError`.
- Catches uncaught React rendering errors and renders `GlobalError.jsx` without exposing internal stack traces.

### [NEW] `frontend/src/pages/error/ServiceUnavailable.jsx`
- Reusable maintenance/network failure screen with system status icon, description, and Retry button.

### [NEW] `frontend/src/services/audit.service.js`
- Frontend API service method `getAuditLogs(params)` querying `GET /admin/audit-logs`.

### [NEW] `frontend/src/pages/admin/AdminAuditLogs.jsx`
- SUPER_ADMIN read-only activity audit log viewer with action/entity filters and pagination.

### [MODIFY] `frontend/src/services/api.js`
- Enhance response interceptor to normalize errors (400, 401, 403, 404, 409, 422, 429, 500, 503, Network Error).
- Dispatch `mobileadda:session-expired` custom window event on 401 responses.

### [MODIFY] `frontend/src/context/AuthContext.jsx`
- Listen for `mobileadda:session-expired` custom window event to automatically clear auth state and notify user.

### [MODIFY] `frontend/src/App.jsx`
- Wrap `AppRoutes` inside `ErrorBoundary`.

### [MODIFY] `frontend/src/routes/AppRoutes.jsx`
- Mount `/admin/audit-logs` route under `RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}`.
- Add route for `/service-unavailable`.

### [MODIFY] `backend/src/controllers/admin-dashboard.controller.js` & `backend/src/routes/admin-dashboard.routes.js`
- Add `getAuditLogs` controller handler calling existing `auditService.getAuditLogs(req.query)` and mount `GET /admin/audit-logs` (SUPER_ADMIN protected).

---

## 3. Regression Safeguards
- Zero modifications to Modules 1–9 business logic, cancellation workflows, notification rendering, or catalog search.
- Zero changes to Tailwind styling tokens or React Router structure.
- Zero external dependencies introduced.
