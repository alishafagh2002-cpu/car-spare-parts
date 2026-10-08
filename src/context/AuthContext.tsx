import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSafe } from '../types/index.ts';

interface AuthContextType {
  user: UserSafe | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSafe | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('yp_auth_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile if token is present
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired
        localStorage.removeItem('yp_auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch auth profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'ورود ناموفق بود' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('yp_auth_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'خطای ارتباط با سرور' };
    }
  };

  const register = async (name: string, phone: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'ثبت‌نام ناموفق بود' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('yp_auth_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'خطای ارتباط با سرور' };
    }
  };

  const demoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@yadakpart.ir', 'admin123456');
    } else {
      await login('customer@gmail.com', 'user123456');
    }
  };

  const logout = () => {
    localStorage.removeItem('yp_auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isSuperAdmin,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
