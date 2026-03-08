import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((userData, token) => {
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    else localStorage.removeItem('user');
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
    setUser(userData);
    setAccessToken(token);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { user: u, accessToken: t } = data.data;
    persistUser(u, t);
    return data;
  }, [persistUser]);

  const register = useCallback(async (name, email, password, role = 'tenant') => {
    const { data } = await authApi.register({ name, email, password, role });
    const { user: u, accessToken: t } = data.data;
    persistUser(u, t);
    return data;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      persistUser(null, null);
    }
  }, [persistUser]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      const u = data.data;
      persistUser({ id: u._id || u.id, name: u.name, email: u.email, role: u.role }, accessToken);
    } catch {
      persistUser(null, null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, persistUser]);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, []);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isTenant: user?.role === 'tenant' || user?.role === 'user',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
