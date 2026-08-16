import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState } from
'react';

interface AdminAuthValue {
  authenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const STORAGE_KEY = 'sincery.admin';

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({
  children


}: {children: React.ReactNode;}): JSX.Element {
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const signIn = useCallback(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {

      /* ignore */}
    setAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {

      /* ignore */}
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ authenticated, signIn, signOut }),
    [authenticated, signIn, signOut]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>);

}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}