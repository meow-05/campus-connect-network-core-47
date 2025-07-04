
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'faculty' | 'mentor' | 'platform_admin'>;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { authUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading skeleton while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but we have specific role requirements
  if (isAuthenticated && allowedRoles && authUser) {
    const hasPermission = allowedRoles.includes(authUser.role);
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (isAuthenticated && location.pathname.startsWith('/auth/')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
