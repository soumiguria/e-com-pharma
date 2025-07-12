// services/api/config.ts
// API configuration and environment settings

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableMock: boolean;
  enableLogging: boolean;
  enableCache: boolean;
  cacheTimeout: number;
}

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
  apiVersion: string;
  appVersion: string;
}

// Environment detection
const isDevelopment = __DEV__;
const isProduction = !isDevelopment;
const isTesting = process.env.NODE_ENV === 'test';

// API Configuration based on environment
export const apiConfig: ApiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 
    (isDevelopment ? 'http://localhost:3000/api' : 'https://api.passkidukaan.com'),
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
  retryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.EXPO_PUBLIC_API_RETRY_DELAY || '1000'),
  enableMock: process.env.EXPO_PUBLIC_ENABLE_MOCK === 'true' || isDevelopment,
  enableLogging: process.env.EXPO_PUBLIC_ENABLE_API_LOGGING === 'true' || isDevelopment,
  enableCache: process.env.EXPO_PUBLIC_ENABLE_CACHE === 'true',
  cacheTimeout: parseInt(process.env.EXPO_PUBLIC_CACHE_TIMEOUT || '300000'), // 5 minutes
};

// Environment configuration
export const environmentConfig: EnvironmentConfig = {
  isDevelopment,
  isProduction,
  isTesting,
  apiVersion: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

// Feature flags
export const featureFlags = {
  voiceSearch: process.env.EXPO_PUBLIC_FEATURE_VOICE_SEARCH === 'true',
  darkMode: process.env.EXPO_PUBLIC_FEATURE_DARK_MODE === 'true',
  notifications: process.env.EXPO_PUBLIC_FEATURE_NOTIFICATIONS === 'true',
  analytics: process.env.EXPO_PUBLIC_FEATURE_ANALYTICS === 'true',
  pushNotifications: process.env.EXPO_PUBLIC_FEATURE_PUSH_NOTIFICATIONS === 'true',
  socialLogin: process.env.EXPO_PUBLIC_FEATURE_SOCIAL_LOGIN === 'true',
  biometricAuth: process.env.EXPO_PUBLIC_FEATURE_BIOMETRIC_AUTH === 'true',
  offlineMode: process.env.EXPO_PUBLIC_FEATURE_OFFLINE_MODE === 'true',
  multiLanguage: process.env.EXPO_PUBLIC_FEATURE_MULTI_LANGUAGE === 'true',
  accessibility: process.env.EXPO_PUBLIC_FEATURE_ACCESSIBILITY === 'true',
};

// API Endpoints configuration
export const apiEndpoints = {
  auth: {
    sendOTP: '/auth/send-otp',
    verifyOTP: '/auth/verify-otp',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  stores: {
    list: '/stores',
    byPincode: '/stores/by-pincode',
    byLocation: '/stores/by-location',
    details: (id: string) => `/stores/${id}`,
    nearby: '/stores/nearby',
    search: '/stores/search',
    reviews: (id: string) => `/stores/${id}/reviews`,
  },
  products: {
    list: '/products',
    byStore: '/products/by-store',
    details: (id: string) => `/products/${id}`,
    search: '/products/search',
    byCategory: (id: string) => `/categories/${id}/products`,
    featured: '/products/featured',
    trending: '/products/trending',
    onSale: '/products/on-sale',
    underPrice: '/products/under-price',
  },
  categories: {
    list: '/categories',
    details: (id: string) => `/categories/${id}`,
    subcategories: (id: string) => `/categories/${id}/subcategories`,
  },
  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: (id: string) => `/cart/items/${id}`,
    removeItem: (id: string) => `/cart/items/${id}`,
    clear: '/cart',
    applyCoupon: '/cart/apply-coupon',
    removeCoupon: '/cart/coupon',
  },
  orders: {
    create: '/orders',
    list: '/orders',
    details: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    track: (id: string) => `/orders/${id}/track`,
    reorder: (id: string) => `/orders/${id}/reorder`,
  },
  user: {
    profile: '/user/profile',
    addresses: '/user/addresses',
    wishlist: '/user/wishlist',
    notifications: '/user/notifications',
    settings: '/user/settings',
  },
  banners: {
    list: '/banners',
    byLocation: '/banners/by-location',
    home: '/banners/home',
    promotional: '/banners/promotional',
  },
};

// HTTP Status codes
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// Error codes
export const errorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Cache keys
export const cacheKeys = {
  user: 'user',
  cart: 'cart',
  products: 'products',
  categories: 'categories',
  stores: 'stores',
  banners: 'banners',
  orders: 'orders',
  wishlist: 'wishlist',
  notifications: 'notifications',
};

// Storage keys
export const storageKeys = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  userProfile: 'user_profile',
  cartData: 'cart_data',
  selectedStore: 'selected_store',
  userLocation: 'user_location',
  appSettings: 'app_settings',
  theme: 'theme',
  language: 'language',
  notifications: 'notifications',
  recentlyViewed: 'recently_viewed',
  searchHistory: 'search_history',
};

// Validation rules
export const validationRules = {
  phone: {
    pattern: /^[+]?[1-9]\d{1,14}$/,
    message: 'Please enter a valid phone number',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  },
  pincode: {
    pattern: /^\d{6}$/,
    message: 'Please enter a valid 6-digit pincode',
  },
};

// Pagination defaults
export const paginationDefaults = {
  page: 1,
  limit: 20,
  maxLimit: 100,
};

// Time formats
export const timeFormats = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  display: 'DD MMM YYYY',
  displayTime: 'DD MMM YYYY, HH:mm',
};

// Currency configuration
export const currencyConfig = {
  code: 'INR',
  symbol: '₹',
  position: 'before' as 'before' | 'after',
  decimalPlaces: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
};

// Delivery configuration
export const deliveryConfig = {
  defaultRadius: 5, // km
  maxRadius: 20, // km
  defaultDeliveryTime: '30-45 min',
  expressDeliveryTime: '15-30 min',
  minimumOrderAmount: 10,
  freeDeliveryThreshold: 500,
  defaultDeliveryFee: 2.99,
  expressDeliveryFee: 4.99,
};

// App configuration
export const appConfig = {
  name: 'Pass Ki Dukaan',
  description: 'Your local grocery and pharmacy delivery app',
  supportEmail: 'support@passkidukaan.com',
  supportPhone: '+91-1800-123-4567',
  website: 'https://passkidukaan.com',
  privacyPolicy: 'https://passkidukaan.com/privacy',
  termsOfService: 'https://passkidukaan.com/terms',
  appStoreUrl: 'https://apps.apple.com/app/pass-ki-dukaan',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.passkidukaan.app',
};

// Export default configuration
export default {
  api: apiConfig,
  environment: environmentConfig,
  features: featureFlags,
  endpoints: apiEndpoints,
  httpStatus,
  errorCodes,
  cacheKeys,
  storageKeys,
  validation: validationRules,
  pagination: paginationDefaults,
  timeFormats,
  currency: currencyConfig,
  delivery: deliveryConfig,
  app: appConfig,
}; 