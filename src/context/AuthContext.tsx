import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { User } from '../types';
import { userAuthApi, getToken, setToken, clearToken, setSignupToken, clearSignupToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Returns 'signup' when the account still has to finish paying or confirm its email.
  login: (email: string, password: string) => Promise<'ok' | 'signup'>;
  // Log in with a token from a finished sign-up (email code confirmed).
  loginWithToken: (token: string, data: unknown) => void;
  register: (name: string, email: string, phone: string, password: string, refCode?: string) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(d: any): User {
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    role: d.role,
    referralCode: d.referralCode,
    referredBy: d.referredBy,
    stage: d.stage ?? 0,
    subscription: d.subscription ?? 'trial',
    createdAt: d.createdAt ?? new Date().toISOString(),
    // Only show a trial date the server actually sent; never guess one.
    trialEndsAt: d.trialEndsAt ?? undefined,
    paidUntil: d.paidUntil ?? undefined,
    paidUp: !!d.paidUp,
    unlockedStages: Array.isArray(d.unlockedStages) ? d.unlockedStages : [],
    renewal: d.renewal === 'auto' ? 'auto' : 'manual',
    autoRenewActive: !!d.autoRenewActive,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from stored token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    userAuthApi.me()
      .then(res => setUser(mapUser(res.data)))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Functions are memoized so pages that list them as effect dependencies
  // don't re-run every time the user object changes.
  const login = useCallback(async (email: string, password: string): Promise<'ok' | 'signup'> => {
    const res = await userAuthApi.login(email, password);
    if (res.signup) {
      setSignupToken(res.signup.token);
      return 'signup';
    }
    setToken(res.token!);
    setUser(mapUser(res.data));
    return 'ok';
  }, []);

  const loginWithToken = useCallback((token: string, data: unknown) => {
    clearSignupToken();
    setToken(token);
    setUser(mapUser(data));
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string, refCode?: string) => {
    await userAuthApi.register(name, email, phone, password, refCode);
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const res = await userAuthApi.verifyEmail(email, otp);
    setToken(res.token);
    setUser(mapUser(res.data));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await userAuthApi.me();
    setUser(mapUser(res.data));
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, loginWithToken, register, verifyEmail, logout, refreshUser }),
    [user, loading, login, loginWithToken, register, verifyEmail, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
