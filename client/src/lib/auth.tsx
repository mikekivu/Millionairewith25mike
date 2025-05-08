import { useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from './queryClient';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  walletBalance: string;
  active: boolean;
  role: string;
  referralCode: string;
  referredBy?: number;
  profileImage?: string;
  country?: string;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  country?: string;
  phoneNumber?: string;
  referralCode?: string;
  terms: boolean;
}

export function useAuth() {
  const { data: user, isLoading, isError, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    throwOnError: false,
  });

  const login = async (credentials: LoginData) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Refetch user data
      await refetch();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Refetch user data
      await refetch();
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Force query cache clear and reset state
      queryClient.clear();
      queryClient.setQueryData(['/api/auth/me'], null);
      
      // Refresh the page to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token and clear cache on error
      localStorage.removeItem('token');
      queryClient.clear();
      queryClient.setQueryData(['/api/auth/me'], null);
      
      // Refresh the page even on error
      window.location.href = '/';
    }
  };

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refetch
  };
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(location));
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login?redirect=' + encodeURIComponent(location));
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate, location]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated && isAdmin ? <>{children}</> : null;
}