import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { setLastPortal } from '../utils/portal';

const AuthContext = createContext(null);

function profileKey(userId) {
  return `wellpath_profile_${userId}`;
}

function loadSavedProfile(userId) {
  try {
    const raw = localStorage.getItem(profileKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mergeUser(user) {
  if (!user) return null;
  const saved = loadSavedProfile(user.id);
  return {
    ...user,
    displayName: saved.displayName || user.fullName || user.email,
    emailAlerts: saved.emailAlerts ?? true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.data.token);
    const merged = mergeUser(res.data.user);
    setLastPortal(merged.role === 'ADMIN' ? 'admin' : 'patient');
    setUser(merged);
    return merged;
  }, []);

  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(
        profileKey(prev.id),
        JSON.stringify({
          displayName: next.displayName,
          emailAlerts: next.emailAlerts,
        })
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setUser(mergeUser(res.data.user)))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({ user, loading, login, logout, updateProfile, isAdmin: user?.role === 'ADMIN' }),
    [user, loading, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
