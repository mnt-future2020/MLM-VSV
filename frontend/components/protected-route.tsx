"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If admin route is required, check if user is admin
    if (requireAdmin && user?.role !== 'admin') {
      router.push('/dashboard'); // Redirect regular users to their dashboard
      return;
    }
  }, [isLoading, isAuthenticated, user, requireAdmin, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication" />;
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have required role
  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}
