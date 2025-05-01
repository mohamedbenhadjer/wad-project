/**
 * Constants used throughout the application
 */

// URLs 
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5173';
export const PLACEHOLDER_IMAGE = import.meta.env.VITE_PLACEHOLDER_IMAGE || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

// Default values
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_CURRENCY = 'DZD';

// Status codes
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'mc-store-cart',
  AUTH: 'mc-store-auth',
  THEME: 'mc-store-theme',
}; 