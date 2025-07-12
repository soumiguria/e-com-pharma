# API Services Documentation

This directory contains a comprehensive API service layer for the Pass Ki Dukaan e-commerce app. The structure is designed to be easily extensible and maintainable, with proper TypeScript typing and error handling.

## 📁 Directory Structure

```
services/api/
├── types.ts              # Comprehensive type definitions
├── client.ts             # Base API client with HTTP handling
├── config.ts             # Configuration and environment settings
├── authService.ts        # Authentication and user management
├── storeService.ts       # Store-related operations
├── productService.ts     # Product and category operations
├── cartService.ts        # Shopping cart operations
├── orderService.ts       # Order management and tracking
├── userService.ts        # User profile and preferences
├── bannerService.ts      # Banner and promotional content
├── mockDataService.ts    # Mock data for development/testing
├── index.ts              # Main exports
└── README.md             # This documentation
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { 
  authService, 
  productService, 
  cartService,
  storeService 
} from '../services/api';

// Authentication
const loginResponse = await authService.verifyOTP('+91-9876543210', '123456');

// Get products
const productsResponse = await productService.getProductsByStore('store1');

// Add to cart
const cartResponse = await cartService.addToCart({
  productId: 'product1',
  quantity: 2,
  storeId: 'store1'
});

// Get stores
const storesResponse = await storeService.getStoresByPincode('110016');
```

### Using Mock Data (Development)

```typescript
import { mockDataService } from '../services/api';

// Use mock data for development
const products = await mockDataService.getProducts();
const categories = await mockDataService.getCategories();
```

## 📋 API Services Overview

### 1. Authentication Service (`authService`)

Handles user authentication and profile management.

```typescript
// Send OTP
await authService.sendOTP('+91-9876543210');

// Verify OTP and login
const response = await authService.verifyOTP('+91-9876543210', '123456');

// Get user profile
const profile = await authService.getProfile();

// Update profile
await authService.updateProfile({ name: 'New Name' });
```

### 2. Store Service (`storeService`)

Manages store-related operations.

```typescript
// Get stores by pincode
const stores = await storeService.getStoresByPincode('110016');

// Get store details
const store = await storeService.getStoreDetails('store1');

// Get nearby stores
const nearbyStores = await storeService.getNearbyStores(28.6139, 77.2090);

// Search stores
const searchResults = await storeService.searchStores('grocery');
```

### 3. Product Service (`productService`)

Handles product and category operations.

```typescript
// Get products by store
const products = await productService.getProductsByStore('store1');

// Get product details
const product = await productService.getProductDetails('product1');

// Search products
const searchResults = await productService.searchProducts('apple');

// Get categories
const categories = await productService.getCategories();

// Get products by category
const categoryProducts = await productService.getProductsByCategory('category1', 'store1');
```

### 4. Cart Service (`cartService`)

Manages shopping cart operations.

```typescript
// Get cart
const cart = await cartService.getCart();

// Add item to cart
await cartService.addToCart({
  productId: 'product1',
  quantity: 2,
  storeId: 'store1'
});

// Update quantity
await cartService.updateCartItemQuantity('item1', 3);

// Remove item
await cartService.removeFromCart('item1');

// Apply coupon
await cartService.applyCoupon('SAVE20');
```

### 5. Order Service (`orderService`)

Handles order management and tracking.

```typescript
// Create order
const order = await orderService.createOrder({
  storeId: 'store1',
  items: [{ productId: 'product1', quantity: 2 }],
  deliveryAddress: address,
  deliveryMethod: 'home_delivery',
  paymentMethod: 'upi'
});

// Get orders
const orders = await orderService.getOrders();

// Track order
const tracking = await orderService.trackOrder('order1');

// Cancel order
await orderService.cancelOrder('order1', 'Changed mind');
```

### 6. User Service (`userService`)

Manages user profile and preferences.

```typescript
// Get user profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({ name: 'New Name' });

// Get addresses
const addresses = await userService.getAddresses();

// Add address
await userService.addAddress({
  type: 'home',
  name: 'Home',
  houseNumber: '123',
  apartment: 'Apartment 4B',
  directions: 'Near red gate',
  location: { latitude: 28.6139, longitude: 77.2090, address: 'Full address' }
});

// Get wishlist
const wishlist = await userService.getWishlist();

// Add to wishlist
await userService.addToWishlist('product1');
```

### 7. Banner Service (`bannerService`)

Handles promotional content and banners.

```typescript
// Get banners
const banners = await bannerService.getBanners();

// Get home banners
const homeBanners = await bannerService.getHomeBanners();

// Track banner click
await bannerService.trackBannerClick('banner1');
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.passkidukaan.com
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_API_RETRY_ATTEMPTS=3
EXPO_PUBLIC_API_RETRY_DELAY=1000

# Features
EXPO_PUBLIC_ENABLE_MOCK=true
EXPO_PUBLIC_ENABLE_API_LOGGING=true
EXPO_PUBLIC_ENABLE_CACHE=true
EXPO_PUBLIC_CACHE_TIMEOUT=300000

# Feature Flags
EXPO_PUBLIC_FEATURE_VOICE_SEARCH=true
EXPO_PUBLIC_FEATURE_DARK_MODE=true
EXPO_PUBLIC_FEATURE_NOTIFICATIONS=true
EXPO_PUBLIC_FEATURE_ANALYTICS=true
```

### Using Configuration

```typescript
import { apiConfig, featureFlags, apiEndpoints } from '../services/api/config';

// Check if mock is enabled
if (apiConfig.enableMock) {
  // Use mock data
}

// Check feature flags
if (featureFlags.voiceSearch) {
  // Enable voice search
}

// Use endpoints
const authEndpoint = apiEndpoints.auth.sendOTP;
```

## 🛠️ Error Handling

All API services return a standardized response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
}
```

### Example Error Handling

```typescript
import { productService } from '../services/api';

try {
  const response = await productService.getProductDetails('product1');
  
  if (response.success) {
    // Handle success
    const product = response.data;
    console.log('Product:', product);
  } else {
    // Handle error
    console.error('Error:', response.error);
  }
} catch (error) {
  // Handle network or other errors
  console.error('Network error:', error);
}
```

## 🔄 Retry Logic

The API client automatically retries failed requests for:
- 5xx server errors
- 429 rate limit errors
- Network errors

Retry configuration can be adjusted in the config file.

## 📱 Offline Support

The API services are designed to work with offline-first architecture:

```typescript
// Check network status
import NetInfo from '@react-native-community/netinfo';

const isConnected = await NetInfo.fetch();

if (isConnected.isConnected) {
  // Use real API
  const products = await productService.getProducts();
} else {
  // Use cached data or mock data
  const cachedProducts = await getCachedProducts();
}
```

## 🧪 Testing

### Using Mock Data Service

```typescript
import { mockDataService } from '../services/api';

// Test with mock data
const products = await mockDataService.getProducts();
const categories = await mockDataService.getCategories();

// Simulate errors
const errorResponse = await mockDataService.simulateError('Test error');
const networkError = await mockDataService.simulateNetworkError();
const timeoutError = await mockDataService.simulateTimeout();
```

### Unit Testing

```typescript
import { productService } from '../services/api';

// Mock the API client
jest.mock('../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

test('should fetch products', async () => {
  const mockProducts = [{ id: '1', name: 'Test Product' }];
  apiClient.get.mockResolvedValue({ success: true, data: mockProducts });
  
  const result = await productService.getProducts();
  expect(result.success).toBe(true);
  expect(result.data).toEqual(mockProducts);
});
```

## 🔒 Security

### Authentication

- JWT tokens are automatically handled
- Tokens are stored securely in AsyncStorage
- Automatic token refresh on expiration
- Automatic logout on authentication errors

### Data Validation

```typescript
import { validationRules } from '../services/api/config';

// Validate phone number
const phonePattern = validationRules.phone.pattern;
const isValidPhone = phonePattern.test('+91-9876543210');

// Validate email
const emailPattern = validationRules.email.pattern;
const isValidEmail = emailPattern.test('user@example.com');
```

## 📊 Analytics and Tracking

### Banner Tracking

```typescript
import { bannerService } from '../services/api';

// Track banner impressions
await bannerService.trackBannerImpression('banner1');

// Track banner clicks
await bannerService.trackBannerClick('banner1');
```

### Product Tracking

```typescript
import { productService } from '../services/api';

// Track recently viewed products
await productService.addToRecentlyViewed('product1');
```

## 🚀 Performance Optimization

### Caching

```typescript
import { apiConfig } from '../services/api/config';

if (apiConfig.enableCache) {
  // Implement caching logic
  const cachedData = await getCachedData('products');
  if (cachedData && !isExpired(cachedData)) {
    return cachedData;
  }
}
```

### Pagination

```typescript
import { paginationDefaults } from '../services/api/config';

const products = await productService.getProductsByStore('store1', {
  page: paginationDefaults.page,
  limit: paginationDefaults.limit
});
```

## 🔧 Customization

### Adding New Services

1. Create a new service file (e.g., `notificationService.ts`)
2. Extend the base API client
3. Add types to `types.ts`
4. Export from `index.ts`

### Custom API Client

```typescript
import { ApiClient } from '../services/api/client';

class CustomApiClient extends ApiClient {
  async customRequest() {
    // Custom implementation
  }
}
```

## 📚 Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Native Networking](https://reactnative.dev/docs/network)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Add unit tests
5. Update documentation

## 📄 License

This API service layer is part of the Pass Ki Dukaan project. 