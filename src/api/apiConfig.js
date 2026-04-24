// src/api/apiConfig.js
/**
 * Get the full API URL based on environment configuration
 * In development, uses Vite proxy (/api) or environment variable
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    // In development, use Vite proxy
    return '';
  }
  
  // In production or when VITE_API_URL is explicitly set, use full URL
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

/**
 * Get full API endpoint URL
 * @param {string} endpoint - The API endpoint (e.g., '/api/articles')
 * @returns {string} The full URL
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${endpoint}` : endpoint;
};

/**
 * Create axios instance with proper URL configuration
 */
export const createApiInstance = () => {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/api` : '/api';
};
