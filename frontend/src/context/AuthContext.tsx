import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hod_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hod_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('hod_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Session refresh failed:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hod_token', newToken);
    localStorage.setItem('hod_user', JSON.stringify(newUser));

    return newUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, user: newUser } = res.data.data;

    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('hod_token', newToken);
    localStorage.setItem('hod_user', JSON.stringify(newUser));

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('hod_token');
    localStorage.removeItem('hod_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
