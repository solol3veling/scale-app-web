import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    // Try to get Supabase session token first
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        // Fallback to localStorage authToken
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get Supabase session, trying localStorage:', error);
      // Fallback to localStorage authToken
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Failed to sign out from Supabase:', e);
      }
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - handle access denied
      console.error('Access denied');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to make API calls with proper error handling
export const makeApiCall = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.errors?.[0] || 
                        error.message || 
                        'An unexpected error occurred';
    
    throw new Error(errorMessage);
  }
};

// Export the configured axios instance
export default apiClient;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_VERSION}${endpoint}`;
};

// Helper function for building query parameters
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// Authentication helpers
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};