/**
 * Authentication context.
 * Holds the current user, exposes login/logout, and restores the session
 * on load by calling /auth/me with the stored token.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client, { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from an existing token.
  useEffect(() => {
    async function restore() {
      if (!tokenStore.access) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.get('/auth/me');
        setUser(data.data.user);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    tokenStore.set(data.data);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = { user, loading, login, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
