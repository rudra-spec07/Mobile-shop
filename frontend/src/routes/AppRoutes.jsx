import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';

// Public Pages
import Home from '../pages/public/Home';
import CatalogPlaceholder from '../pages/public/CatalogPlaceholder';
import AuthPlaceholder from '../pages/public/AuthPlaceholder';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerPlaceholder from '../pages/customer/CustomerPlaceholder';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPlaceholder from '../pages/admin/AdminPlaceholder';

// Error Pages
import NotFound from '../pages/error/NotFound';
import AccessDenied from '../pages/error/AccessDenied';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/mobiles" element={<CatalogPlaceholder />} />
      <Route path="/mobiles/:id" element={<CatalogPlaceholder />} />
      <Route path="/parts" element={<CatalogPlaceholder />} />
      <Route path="/parts/:id" element={<CatalogPlaceholder />} />
      <Route path="/login" element={<AuthPlaceholder />} />
      <Route path="/register" element={<AuthPlaceholder />} />

      {/* Customer Panel Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
              <CustomerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/:section"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
              <CustomerPlaceholder />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:section"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminPlaceholder />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Error & Fallback Routes */}
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
