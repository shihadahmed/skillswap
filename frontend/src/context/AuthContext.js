'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ss_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('ss_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('ss_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('ss_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
