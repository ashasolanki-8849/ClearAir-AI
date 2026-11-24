import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('clearair_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshProfile = async () => {
    const currentToken = localStorage.getItem('clearair_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiClient<{ success: boolean; user: User }>('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('clearair_token');
        setUser(null);
        setToken(null);
      }
    } catch (err: any) {
      localStorage.removeItem('clearair_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        bodyData: { email, password },
      });

      if (data.success && data.token) {
        localStorage.setItem('clearair_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.fullName}!`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Login failed', 'error');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const data = await apiClient<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        bodyData: userData,
      });

      if (data.success && data.token) {
        localStorage.setItem('clearair_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Account created! Welcome to ClearAir AI, ${data.user.fullName}.`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Registration failed', 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('clearair_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out safely.', 'info');
  };

  const updateUserProfile = async (updateData: Partial<User>) => {
    try {
      const data = await apiClient<{ success: boolean; user: User }>('/user/profile', {
        method: 'PUT',
        bodyData: updateData,
      });

      if (data.success && data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
        showToast('Profile updated successfully.', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile.', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
