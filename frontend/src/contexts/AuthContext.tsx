import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { logToCloudflare as logger } from '../utils/logger';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'engineer' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check sessionStorage on mount
    try {
      const storedUser = sessionStorage.getItem('insight_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      logger('error', 'Failed to parse user from session storage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const userData = data.user;
      
      setUser(userData);
      sessionStorage.setItem('insight_user', JSON.stringify(userData));
      logger('info', 'User logged in successfully');
    } catch (error) {
      logger('error', 'Login error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      logger('error', 'Logout API error', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('insight_user');
      logger('info', 'User logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
