// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
//import '../styles/ProtectedRoute.css';

/**
 * @param {{ children: import('react').ReactNode, requiredRoles?: string[] }} props
 */
const ProtectedRoute = ({ children, requiredRoles = ['admin', 'teacher'] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading teachers dashboard...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have required role, show unauthorized or redirect
  if (requiredRoles && user?.role) {
    const userRole = user.role.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role => 
      userRole.includes(role.toLowerCase())
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;