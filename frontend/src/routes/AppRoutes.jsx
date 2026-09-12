import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';
import Loader from '../components/common/Loader';

// Core Public Pages (Eager loaded for immediate landing experience)
import Home from '../pages/public/Home';
import TermsAndConditions from '../pages/public/TermsAndConditions';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';

// Lazy Loaded Public Pages
const CustomerMobileCatalog = lazy(() => import('../pages/public/CustomerMobileCatalog'));
const CustomerMobileDetails = lazy(() => import('../pages/public/CustomerMobileDetails'));
const CustomerPartsCatalog = lazy(() => import('../pages/public/CustomerPartsCatalog'));
const CustomerPartDetails = lazy(() => import('../pages/public/CustomerPartDetails'));
const AuthPlaceholder = lazy(() => import('../pages/public/AuthPlaceholder'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));

// Lazy Loaded Customer Panel Pages
const CustomerDashboard = lazy(() => import('../pages/customer/CustomerDashboard'));
const CustomerPlaceholder = lazy(() => import('../pages/customer/CustomerPlaceholder'));
const Profile = lazy(() => import('../pages/customer/Profile'));
const ChangePassword = lazy(() => import('../pages/customer/ChangePassword'));
const CustomerMyEnquiries = lazy(() => import('../pages/customer/CustomerMyEnquiries'));
const CustomerMyRequests = lazy(() => import('../pages/customer/CustomerMyRequests'));
const CustomerRequestDetails = lazy(() => import('../pages/customer/CustomerRequestDetails'));
const CustomerNotifications = lazy(() => import('../pages/customer/CustomerNotifications'));

// Lazy Loaded Super Admin Panel Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminMobileList = lazy(() => import('../pages/admin/AdminMobileList'));
const AdminMobileDetails = lazy(() => import('../pages/admin/AdminMobileDetails'));
const AdminPartsList = lazy(() => import('../pages/admin/AdminPartsList'));
const AdminPartDetails = lazy(() => import('../pages/admin/AdminPartDetails'));
const AdminEnquiryList = lazy(() => import('../pages/admin/AdminEnquiryList'));
const AdminRequestList = lazy(() => import('../pages/admin/AdminRequestList'));
const InventoryDashboard = lazy(() => import('../pages/admin/InventoryDashboard'));
const LowStockReport = lazy(() => import('../pages/admin/LowStockReport'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminCustomerList = lazy(() => import('../pages/admin/AdminCustomerList'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminPlaceholder = lazy(() => import('../pages/admin/AdminPlaceholder'));

// Error Pages
const NotFound = lazy(() => import('../pages/error/NotFound'));
const AccessDenied = lazy(() => import('../pages/error/AccessDenied'));
const ServiceUnavailable = lazy(() => import('../pages/error/ServiceUnavailable'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Loader text="Loading section..." />
  </div>
);

import ServicesPage from '../pages/public/ServicesPage';

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/mobiles" element={<CustomerMobileCatalog />} />
        <Route path="/mobiles/:id" element={<CustomerMobileDetails />} />
        <Route path="/parts" element={<CustomerPartsCatalog />} />
        <Route path="/parts/:id" element={<CustomerPartDetails />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={<AuthPlaceholder />} />
        <Route path="/register" element={<AuthPlaceholder />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Customer Panel Protected Routes */}
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
          path="/customer/enquiries"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <CustomerMyEnquiries />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/requests"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <CustomerMyRequests />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/requests/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <CustomerRequestDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <Profile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <CustomerNotifications />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/change-password"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CUSTOMER, ROLES.SUPER_ADMIN]}>
                <ChangePassword />
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

        {/* Super Admin Panel Protected Routes */}
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
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminNotifications />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminEnquiryList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminRequestList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminRequestList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mobiles"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminMobileList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mobiles/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminMobileDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parts"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminPartsList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parts/:id"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminPartDetails />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <InventoryDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory/low-stock"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <LowStockReport />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminCustomerList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminCustomerList />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminSettings />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Profile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <ChangePassword />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <AdminAuditLogs />
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
        <Route path="/service-unavailable" element={<ServiceUnavailable />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
