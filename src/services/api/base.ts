import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';
import { ENV } from '@/constants/env';

// API Configuration
export const API_CONFIG = {
    BASE_URL: ENV.API_BASE_URL,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Create axios instance with enhanced configuration
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    });

    // Request interceptor for auth and logging
    client.interceptors.request.use(
        async (config) => {
            // Add auth token if available
            const token = await getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {
            console.error('🚨 Request Error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling and logging
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config;

            // Handle 401 errors (Unauthorized) - but be more careful
            if (error.response?.status === 401) {
                console.warn('🔐 Unauthorized access detected');

                // Only clear tokens and redirect if we're sure it's an auth issue
                // and not just an API endpoint that doesn't exist or isn't set up yet
                const { supabase } = await import('@/integrations/supabase/client');
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    console.warn('🔐 No valid session found - redirecting to auth');
                    await removeAuthToken();

                    // Redirect to auth page if not already there
                    if (!window.location.pathname.includes('/auth')) {
                        window.location.href = '/auth';
                    }
                } else {
                    console.warn('🔐 Valid session exists but API returned 401 - API might not be configured properly');
                }
            }

            // Handle 403 errors (Forbidden)
            if (error.response?.status === 403) {
                console.error('🚫 Access forbidden');
            }

            // Handle 5xx errors (Server errors)
            if (error.response?.status && error.response.status >= 500) {
                console.error('🔥 Server error:', error.response.data);
            }


            return Promise.reject(error);
        }
    );

    return client;
};

// Create the main API client instance
export const apiClient = createApiClient();

// Enhanced API call wrapper with retry logic and better error handling
export const makeApiCall = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: {
        retries?: number;
        retryDelay?: number;
        skipErrorHandling?: boolean;
    } = {}
): Promise<T> => {
    const { retries = API_CONFIG.RETRY_ATTEMPTS, retryDelay = API_CONFIG.RETRY_DELAY, skipErrorHandling = false } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await requestFn();
            return response.data;
        } catch (error: any) {
            lastError = error;

            // Don't retry on client errors (4xx) except 429 (rate limit)
            if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
                break;
            }

            // Don't retry on the last attempt
            if (attempt === retries) {
                break;
            }

            // Wait before retrying with exponential backoff
            const delay = retryDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Handle the final error
    if (!skipErrorHandling) {
        throw new ApiError(lastError);
    }

    throw lastError;
};

export const makeCriticalApiCall = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: {
        skipErrorHandling?: boolean;
    } = {}
): Promise<T> => {
    const { skipErrorHandling = false } = options;

    try {
        const response = await requestFn();
        return response.data;
    } catch (error: any) {
        // Handle the error
        if (!skipErrorHandling) {
            throw new ApiError(error);
        }
        throw error;
    }
};

// Custom API Error class
export class ApiError extends Error {
    public status?: number;
    public data?: any;
    public isApiError = true;

    constructor(error: any) {
        if (error.response) {
            // Server responded with error status
            super(error.response.data?.message || error.response.statusText || 'API request failed');
            this.status = error.response.status;
            this.data = error.response.data;
        } else if (error.request) {
            // Request was made but no response received
            super('Network error - please check your connection');
        } else {
            // Something else happened
            super(error.message || 'An unexpected error occurred');
        }

        this.name = 'ApiError';
    }
}

// Helper functions
export const buildApiUrl = (endpoint: string, version: string = '/api/v1'): string => {
    return `${version}${endpoint}`;
};

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

export const getAuthToken = async (): Promise<string | null> => {
    try {
        // First try to get token from Supabase directly
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
            return session.access_token;
        }

        // Fallback to localStorage
        const authData = localStorage.getItem(ENV.SUPABASE_AUTH_TOKEN_KEY);
        if (!authData) {
            return null;
        }

        // Parse the JSON object and extract the access_token
        const parsed = JSON.parse(authData);
        return parsed.access_token || null;
    } catch (error) {
        console.warn('Failed to get auth token:', error);
        return null;
    }
};

export const removeAuthToken = async (): Promise<void> => {
    try {
        // Use Supabase's signOut method instead of just clearing localStorage
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.auth.signOut();
    } catch (error) {
        console.warn('Failed to sign out via Supabase, clearing localStorage manually:', error);
        localStorage.removeItem(ENV.SUPABASE_AUTH_TOKEN_KEY);
        localStorage.removeItem('authToken');
    }
};

// Network status helpers
export const isOnline = (): boolean => {
    return navigator.onLine;
};

export const waitForOnline = (): Promise<void> => {
    return new Promise((resolve) => {
        if (isOnline()) {
            resolve();
            return;
        }

        const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            resolve();
        };

        window.addEventListener('online', handleOnline);
    });
};
