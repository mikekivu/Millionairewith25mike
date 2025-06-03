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

      // Always check content type first
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Server returned HTML or other non-JSON content
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorMessage = response.status === 404 ? 'Login endpoint not found' : 
                         response.status >= 500 ? 'Server error occurred' : 
                         'Login failed';
          }
        } catch {
          errorMessage = 'Network error';
        }
        throw new Error(errorMessage);
      }

      // Check if successful response is JSON
      if (!isJson) {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (!data.success || !data.token) {
        throw new Error(data.message || 'No authentication token received');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Refetch user data
      await refetch();

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);

      // Always check content type first
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Server returned HTML or other non-JSON content
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorMessage = response.status === 404 ? 'Registration endpoint not found' : 
                         response.status >= 500 ? 'Server error occurred' : 
                         'Registration failed';
          }
        } catch {
          errorMessage = 'Network error';
        }
        throw new Error(errorMessage);
      }

      // Check if successful response is JSON
      if (!isJson) {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Server returned invalid response format');
      }

      const data = await response.json();
      console.log('Register response data:', data);

      if (!data.token) {
        throw new Error(data.message || 'No authentication token received');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Refetch user data
      await refetch();

      return data;
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration');
    }
  };

  const logout = async () => {
    try {
      // Clear token from localStorage first
      localStorage.removeItem('token');
      
      // Clear query cache and reset authentication state
      queryClient.clear();
      queryClient.setQueryData(['/api/auth/me'], null);
      
      // Call logout endpoint
      await apiRequest('POST', '/api/auth/logout');
      
      // Force a complete page reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still clear local state
      localStorage.removeItem('token');
      queryClient.clear();
      queryClient.setQueryData(['/api/auth/me'], null);
      
      // Force page reload
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