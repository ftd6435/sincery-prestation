import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export function RequireAdmin({ children }: {children: ReactNode;}) {
  const { authenticated } = useAdminAuth();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
