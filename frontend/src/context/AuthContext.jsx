'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/auth/me')
      .then((data) => {
        if (active) setUser(data.user || data);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token && typeof window !== 'undefined')
      window.localStorage.setItem('ss_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password, image, role }) => {
    const data = await api.post('/auth/register', {
      name,
      email,
      password,
      image,
      role,
    });
    if (data.token && typeof window !== 'undefined')
      window.localStorage.setItem('ss_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem('ss_token');
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // ignore network errors on logout
    }
    setUser(null);
    toast.info('Logged out successfully.');
  };

  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u));

  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      const fresh = data.user || data;
      if (fresh) setUser(fresh);
      return fresh;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
