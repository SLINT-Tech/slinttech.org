/**
 * API Configuration
 * 
 * This module provides a centralized API client that handles:
 * - Environment-aware base URL configuration
 * - Automatic token management
 * - Consistent error handling
 * 
 * For Azure Static Web Apps deployment:
 * - In production, the API is served from /api/* (handled by SWA API routing)
 * - In development, you can set VITE_API_BASE_URL to point to the Express server
 */

// Get the API base URL from environment variables or use relative path (for Azure SWA)
const getApiBaseUrl = (): string => {
  // In development, use VITE_API_BASE_URL if set, otherwise use relative path
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For Azure Static Web Apps, the API is served from the same domain under /api
  // In production and local dev without explicit URL, use relative path
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Get the stored authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Build the full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /api
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * Make an authenticated API request
 * 
 * @param endpoint - The API endpoint (e.g., '/auth-me' or '/api/auth-me')
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export const apiFetch = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
  const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = buildApiUrl(endpoint);
  
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
};

/**
 * Make a GET request
 */
export const apiGet = (endpoint: string, options?: FetchOptions): Promise<Response> => {
  return apiFetch(endpoint, { ...options, method: 'GET' });
};

/**
 * Make a POST request
 */
export const apiPost = (endpoint: string, data?: any, options?: FetchOptions): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PUT request
 */
export const apiPut = (endpoint: string, data?: any, options?: FetchOptions): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a DELETE request
 */
export const apiDelete = (endpoint: string, data?: any, options?: FetchOptions): Promise<Response> => {
  return apiFetch(endpoint, {
    ...options,
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Upload a file using FormData
 */
export const apiUpload = async (endpoint: string, formData: FormData): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = buildApiUrl(endpoint);
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
};

/**
 * Download a file (returns blob)
 */
export const apiDownload = async (endpoint: string): Promise<Blob> => {
  const response = await apiFetch(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }
  
  return response.blob();
};

export default {
  API_BASE_URL,
  getAuthToken,
  buildApiUrl,
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  upload: apiUpload,
  download: apiDownload,
};

