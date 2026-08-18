import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearStoredToken,
  TOKEN_STORAGE_KEY,
  ApiRequestError,
} from '../lib/api';
import type { ApiUser } from '../types/admin';

interface AdminAuthValue {
  user: ApiUser | null;
  authenticated: boolean;
  loading: boolean;
  loginError: string | null;
  /** Submitted telephone + password. Returns the user on success, or throws. */
  signIn: (telephone: string, password: string) => Promise<ApiUser>;
  signOut: () => Promise<void>;
  updateProfile: (payload: FormData | Record<string, unknown>) => Promise<ApiUser>;
  updatePassword: (
    current_password: string,
    new_password: string,
    new_password_confirmation?: string,
  ) => Promise<ApiUser>;
  /** Trigger a refetch of /me (for example after profile updates). */
  refreshUser: () => Promise<ApiUser | null>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

const USER_STORAGE_KEY = 'sincery.admin.user';

function readStoredUser(): ApiUser | null {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: ApiUser | null): void {
  try {
    if (user === null) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    /* ignore */
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<ApiUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !!window.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return false;
    }
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const refreshTokenRef = useRef<Promise<ApiUser | null> | null>(null);

  // On first load: if token is present → validate against /api/v1/auth/me
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let token = null;
        try {
          token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        if (!token) {
          if (!cancelled) setLoading(false);
          return;
        }
        const u = await api.get<ApiUser>('/v1/auth/me');
        if (!cancelled) {
          setUser(u);
          writeStoredUser(u);
        }
      } catch (e) {
        clearStoredToken();
        writeStoredUser(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Listen to global 401 events fired by lib/api.ts
  useEffect(() => {
    const handler = () => {
      setUser(null);
      writeStoredUser(null);
      clearStoredToken();
    };
    window.addEventListener('sincery:auth:logged-out', handler);
    return () => window.removeEventListener('sincery:auth:logged-out', handler);
  }, []);

  const signIn = useCallback(async (telephone: string, password: string): Promise<ApiUser> => {
    setLoginError(null);
    setLoading(true);
    try {
      // SuccessResponseWithToken shape: { user, token } at top-level 'data'
      // ApiRequest already stores the token when it sees top-level "token"
      const user = await api.post<ApiUser>('/v1/auth/login', { telephone, password });
      setUser(user);
      writeStoredUser(user);
      return user;
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Erreur lors de la connexion';
      setLoginError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/v1/auth/logout');
    } catch (e) {
      // ignore backend failures on logout, still wipe client state
    }
    clearStoredToken();
    writeStoredUser(null);
    setUser(null);
    setLoginError(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async (): Promise<ApiUser | null> => {
    if (refreshTokenRef.current) return refreshTokenRef.current;
    setLoading(true);
    const promise = (async () => {
      try {
        const u = await api.get<ApiUser>('/v1/auth/me');
        setUser(u);
        writeStoredUser(u);
        return u;
      } catch (e) {
        clearStoredToken();
        writeStoredUser(null);
        setUser(null);
        return null;
      } finally {
        refreshTokenRef.current = null;
        setLoading(false);
      }
    })();
    refreshTokenRef.current = promise;
    return promise;
  }, []);

  const updateProfile = useCallback(
    async (payload: FormData | Record<string, unknown>): Promise<ApiUser> => {
      const u = await api.put<ApiUser>('/v1/auth/me', payload);
      setUser(u);
      writeStoredUser(u);
      return u;
    },
    [],
  );

  const updatePassword = useCallback(
    async (
      current_password: string,
      new_password: string,
      new_password_confirmation?: string,
    ): Promise<ApiUser> => {
      const body: Record<string, string> = { current_password, new_password };
      if (typeof new_password_confirmation === 'string') {
        body.new_password_confirmation = new_password_confirmation;
      }
      const u = await api.put<ApiUser>('/v1/auth/password', body);
      setUser(u);
      writeStoredUser(u);
      return u;
    },
    [],
  );

  const value = useMemo<AdminAuthValue>(
    () => ({
      user,
      authenticated: !!user,
      loading,
      loginError,
      signIn,
      signOut,
      updateProfile,
      updatePassword,
      refreshUser,
    }),
    [user, loading, loginError, signIn, signOut, updateProfile, updatePassword, refreshUser],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
