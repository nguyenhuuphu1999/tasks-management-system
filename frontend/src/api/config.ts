
// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get stored token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Default headers for API requests
export const getDefaultHeaders = (token?: string | null) => {
  const authToken = token || getAuthToken();
  
  return {
    'Authorization': authToken ? `Bearer ${authToken}` : '',
    'Content-Type': 'application/json'
  };
};
