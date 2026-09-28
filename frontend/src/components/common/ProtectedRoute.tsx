import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B79A65] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-[#766F66]">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If reception attempts admin route, redirect to reception dashboard
    if (role === 'RECEPTION') {
      return <Navigate to="/reception/dashboard" replace />;
    }
    // If customer attempts staff route, redirect to my bookings
    if (role === 'CUSTOMER') {
      return <Navigate to="/customer/bookings" replace />;
    }
    // If admin attempts other, redirect to admin dashboard
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
