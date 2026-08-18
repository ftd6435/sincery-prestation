import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface-page">
        <div className="h-10 w-10 rounded-full border-2 border-brand border-t-transparent animate-spin" aria-label="Chargement…" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  }

  return <>{children}</>;
}
