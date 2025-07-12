// services/api/index.ts
// Main API service exports

// Export all services
export { default as authService } from './authService';
export { default as storeService } from './storeService';
export { default as productService } from './productService';
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as userService } from './userService';
export { default as bannerService } from './bannerService';

// Export API client
export { default as apiClient } from './client';

// Export types
export * from './types';

// Export individual service classes for advanced usage
export { AuthService } from './authService';
export { StoreService } from './storeService';
export { ProductService } from './productService';
export { CartService } from './cartService';
export { OrderService } from './orderService';
export { UserService } from './userService';
export { BannerService } from './bannerService'; 