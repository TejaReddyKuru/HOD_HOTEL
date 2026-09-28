import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ReceptionLayout } from '../layouts/ReceptionLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { BranchesPage } from '../pages/public/BranchesPage';
import { BranchDetailPage } from '../pages/public/BranchDetailPage';
import { RoomsPage } from '../pages/public/RoomsPage';
import { RoomDetailPage } from '../pages/public/RoomDetailPage';
import { StoryPage } from '../pages/public/StoryPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Customer Pages
import { CustomerBookingsPage } from '../pages/customer/CustomerBookingsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Reception Pages
import { ReceptionDashboardPage } from '../pages/reception/ReceptionDashboardPage';
import { ReceptionWalkInPage } from '../pages/reception/ReceptionWalkInPage';
import { ReceptionBookingsPage } from '../pages/reception/ReceptionBookingsPage';
import { ReceptionRoomsPage } from '../pages/reception/ReceptionRoomsPage';
import { ReceptionPaymentsPage } from '../pages/reception/ReceptionPaymentsPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminBranchesPage } from '../pages/admin/AdminBranchesPage';
import { AdminRoomsPage } from '../pages/admin/AdminRoomsPage';
import { AdminRoomTypesPage } from '../pages/admin/AdminRoomTypesPage';
import { AdminAmenitiesPage } from '../pages/admin/AdminAmenitiesPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminReceptionPage } from '../pages/admin/AdminReceptionPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminOffersPage } from '../pages/admin/AdminOffersPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public & Customer Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/branches/:id" element={<BranchDetailPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Protected */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
          <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
        </Route>
      </Route>

      {/* 2. Reception Front Desk Routes (Strict 1-Branch Role Isolation) */}
      <Route element={<ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']} />}>
        <Route element={<ReceptionLayout />}>
          <Route path="/reception/dashboard" element={<ReceptionDashboardPage />} />
          <Route path="/reception/walk-in" element={<ReceptionWalkInPage />} />
          <Route path="/reception/bookings" element={<ReceptionBookingsPage />} />
          <Route path="/reception/rooms" element={<ReceptionRoomsPage />} />
          <Route path="/reception/payments" element={<ReceptionPaymentsPage />} />
        </Route>
      </Route>

      {/* 3. Admin Owner Routes (Global Multi-Branch Management) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/branches" element={<AdminBranchesPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/room-types" element={<AdminRoomTypesPage />} />
          <Route path="/admin/amenities" element={<AdminAmenitiesPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/reception" element={<AdminReceptionPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/offers" element={<AdminOffersPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
