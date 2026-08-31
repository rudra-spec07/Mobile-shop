import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';

// Public Pages
import Home from '../pages/public/Home';
import CustomerMobileCatalog from '../pages/public/CustomerMobileCatalog';
import CustomerMobileDetails from '../pages/public/CustomerMobileDetails';
import CustomerPartsCatalog from '../pages/public/CustomerPartsCatalog';
import CustomerPartDetails from '../pages/public/CustomerPartDetails';
import CatalogPlaceholder from '../pages/public/CatalogPlaceholder';
import AuthPlaceholder from '../pages/public/AuthPlaceholder';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

// Customer Pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerPlaceholder from '../pages/customer/CustomerPlaceholder';
import Profile from '../pages/customer/Profile';
import ChangePassword from '../pages/customer/ChangePassword';
import CustomerMyEnquiries from '../pages/customer/CustomerMyEnquiries';
import CustomerMyRequests from '../pages/customer/CustomerMyRequests';
import CustomerRequestDetails from '../pages/customer/CustomerRequestDetails';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminMobileList from '../pages/admin/AdminMobileList';
import AdminMobileDetails from '../pages/admin/AdminMobileDetails';
import AdminPartsList from '../pages/admin/AdminPartsList';
import AdminPartDetails from '../pages/admin/AdminPartDetails';
import AdminEnquiryList from '../pages/admin/AdminEnquiryList';
import AdminRequestList from '../pages/admin/AdminRequestList';
import InventoryDashboard from '../pages/admin/InventoryDashboard';
import LowStockReport from '../pages/admin/LowStockReport';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminCustomerList from '../pages/admin/AdminCustomerList';
import AdminPlaceholder from '../pages/admin/AdminPlaceholder';

// Error Pages
import NotFound from '../pages/error/NotFound';
import AccessDenied from '../pages/error/AccessDenied';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/mobiles" element={<CustomerMobileCatalog />} />
      <Route path="/mobiles/:id" element={<CustomerMobileDetails />} />
      <Route path="/parts" element={<CustomerPartsCatalog />} />
      <Route path="/parts/:id" element={<CustomerPartDetails />} />
      <Route path="/login" element={<AuthPlaceholder />} />
      <Route path="/register" element={<AuthPlaceholder />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
