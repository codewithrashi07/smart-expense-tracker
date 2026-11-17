import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smarttrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smarttrack_token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('smarttrack_theme') !== 'light';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('smarttrack_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          localStorage.setItem('smarttrack_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Auth check failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('smarttrack_token', res.token);
    localStorage.setItem('smarttrack_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('smarttrack_token', res.token);
    localStorage.setItem('smarttrack_user', JSON.stringify(res.user));
    return res;
  };

  const demoLogin = async () => {
    return await login('demo@smarttrack.ai', 'Password123!');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smarttrack_token');
    localStorage.removeItem('smarttrack_user');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('smarttrack_user', JSON.stringify(updated));
  };

  const formatCurrency = (amount = 0) => {
    const currency = user?.currency || 'USD';
    const symbolMap = {
      USD: '$',
      EUR: '€',
      INR: '₹',
      GBP: '£',
      CAD: 'CA$',
      AUD: 'A$',
      JPY: '¥',
    };
    const symbol = symbolMap[currency] || '$';
    return `${symbol}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        darkMode,
        setDarkMode,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        formatCurrency,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
