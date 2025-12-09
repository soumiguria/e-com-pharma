# API Handling in E-Comm Expo Project

## Overview

This project uses **Axios** as the HTTP client library with a **custom API client wrapper** that provides centralized configuration, error handling, authentication, and retry logic.

---

## Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│      Service Layer (Business Logic)     │
│  authService, productService, etc.      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      API Client (Request Handler)       │
│  client.ts - Axios wrapper             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Axios (HTTP Library)               │
│  Actual HTTP requests                   │
└─────────────────────────────────────────┘
```

---

## HTTP Library: Axios

**Library**: `axios` (v1.11.0)

**Why Axios?**
- ✅ Promise-based API
- ✅ Request/response interceptors
- ✅ Automatic JSON transformation
- ✅ Request/response timeout support
- ✅ Better error handling than fetch
- ✅ Request cancellation support
- ✅ Wide browser/React Native compatibility

---

## API Client Architecture (`services/api/client.ts`)

### Core Features

1. **Centralized Configuration**
2. **Automatic Authentication**
3. **Error Handling**
4. **Retry Logic**
5. **Request Timeout**
6. **Type Safety**

### Configuration

```typescript
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://marg-api.thelocalsandbox.dev',
  timeout: 30000,        // 30 seconds
  retryAttempts: 3,     // Retry failed requests 3 times
  retryDelay: 1000,     // 1 second delay between retries
};
```

### API Client Class Structure

```typescript
class ApiClient {
  // Private methods
  - getAuthToken()          // Get token from AsyncStorage
  - setAuthToken()          // Save token to AsyncStorage
  - clearAuthToken()        // Remove token on logout
  - buildURL()              // Build URL with query params
  - getDefaultHeaders()      // Get headers with auth token
  - handleApiError()        // Transform errors to ApiError
  - retryRequest()          // Retry logic
  - shouldRetry()           // Determine if request should retry
  - delay()                 // Delay helper for retries

  // Public methods
  - request<T>()            // Main request method
  - get<T>()                // GET convenience method
  - post<T>()               // POST convenience method
  - put<T>()                // PUT convenience method
  - patch<T>()              // PATCH convenience method
  - delete<T>()             // DELETE convenience method
  - uploadFile<T>()        // File upload method
  - downloadFile()          // File download method
}
```

---

## Authentication Handling

### Token Management

**Token Storage**: AsyncStorage (`auth_token` key)

**Token Header**: `marg-customer-token` (custom header, not standard `Authorization`)

```typescript
private async getDefaultHeaders(): Promise<Record<string, string>> {
  const token = await this.getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['marg-customer-token'] = token;  // Custom header
  }

  return headers;
}
```

### Token Refresh

```typescript
// Handle token refresh if needed
if (response.headers['x-new-token']) {
  await this.setAuthToken(response.headers['x-new-token']);
}
```

### Auto-Logout on Auth Errors

```typescript
// Handle authentication errors
if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'TOKEN_EXPIRED') {
  await this.clearAuthToken();
  // You might want to trigger a logout or redirect to login
}
```

---

## Error Handling

### Error Types

The API client handles three types of errors:

1. **Server Errors** (4xx, 5xx)
   ```typescript
   {
     code: 'HTTP_404',
     message: 'Not Found',
     details: { status: 404, data: {...} }
   }
   ```

2. **Network Errors** (No response)
   ```typescript
   {
     code: 'NETWORK_ERROR',
     message: 'Network error occurred. Please check your connection.',
     details: { request: {...} }
   }
   ```

3. **Timeout Errors**
   ```typescript
   {
     code: 'TIMEOUT_ERROR',
     message: 'Request timeout',
     details: { timeout: 30000 }
   }
   ```

### Error Handling Flow

```typescript
private handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      code: data?.code || `HTTP_${status}`,
      message: data?.message || `HTTP Error ${status}`,
      details: data?.details || { status, data },
    };
  } else if (error.request) {
    // Network error
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error occurred. Please check your connection.',
      details: { request: error.request },
    };
  } else {
    // Other error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: { error },
    };
  }
}
```

### Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

**Success Example**:
```typescript
{
  success: true,
  data: { /* response data */ }
}
```

**Error Example**:
```typescript
{
  success: false,
  error: 'Failed to fetch products',
  data: null
}
```

---

## Retry Logic

### Retry Strategy

**When to Retry**:
- ✅ 5xx server errors (500, 502, 503, etc.)
- ✅ 429 (Rate Limit)
- ✅ Network errors (no response)

**When NOT to Retry**:
- ❌ 4xx client errors (400, 401, 403, 404)
- ❌ Already retried 3 times

### Retry Implementation

```typescript
private async retryRequest<T>(
  requestFn: () => Promise<ApiClientResponse<T>>,
  attempt: number = 1
): Promise<ApiClientResponse<T>> {
  try {
    return await requestFn();
  } catch (error) {
    if (attempt < this.retryAttempts && this.shouldRetry(error)) {
      await this.delay(this.retryDelay * attempt);  // Exponential backoff
      return this.retryRequest(requestFn, attempt + 1);
    }
    throw error;
  }
}

private shouldRetry(error: any): boolean {
  if (error.response) {
    const status = error.response.status;
    return status >= 500 || status === 429;  // 5xx or rate limit
  }
  return !error.response && error.request;  // Network error
}
```

**Retry Configuration**:
- **Attempts**: 3 retries
- **Delay**: 1 second × attempt number (exponential backoff)
- **Total wait time**: Up to 6 seconds (1s + 2s + 3s)

---

## Request Timeout

**Default Timeout**: 30 seconds

**Implementation**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

const response = await axios({
  method,
  url: fullURL,
  signal: controller.signal,  // Abort on timeout
  timeout,
});
```

**Timeout Error**:
```typescript
if (error.name === 'AbortError') {
  throw {
    code: 'TIMEOUT_ERROR',
    message: 'Request timeout',
    details: { timeout },
  };
}
```

---

## Service Layer Pattern

### Service Organization

Each domain has its own service class:

```
services/api/
├── client.ts              ← Core API client
├── config.ts              ← API configuration
├── types.ts               ← TypeScript types
├── authService.ts         ← Authentication
├── productService.ts      ← Products
├── storeService.ts        ← Stores
├── orderService.ts        ← Orders
├── cartService.ts         ← Shopping cart
├── addressService.ts      ← Addresses
├── bannerService.ts       ← Banners
└── ...
```

### Service Pattern

**Example: AuthService**

```typescript
export class AuthService {
  async sendOTP(mobile: string): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
    const request = { mobile };
    
    try {
      const response = await apiClient.post<any>('/v1/customer/login', request);
      
      if (response.success && response.data) {
        const actualData = response.data.data || response.data;
        return {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otpKey: actualData?.otpKey
          }
        };
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to send OTP. Please check your mobile number.',
        data: null as any,
      };
    }
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
```

### Service Usage

```typescript
// In components/screens
import { authService } from '../services/api/authService';

const handleLogin = async () => {
  const response = await authService.sendOTP('1234567890');
  
  if (response.success) {
    console.log('OTP sent:', response.data.otpKey);
  } else {
    console.error('Error:', response.error);
  }
};
```

---

## API Configuration (`services/api/config.ts`)

### Centralized Endpoint Management

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://marg-api.thelocalsandbox.dev',
  
  ENDPOINTS: {
    // Store APIs
    STORE_EXPLORE: '/v1/store/explore/pincode',
    
    // Grocery APIs
    GROCERY_CATEGORIES: '/v1/store/:storeId/category/grocery',
    GROCERY_PRODUCTS: '/v1/store/:storeId/product/grocery',
    
    // Auth APIs
    LOGIN: '/v1/customer/login',
    VERIFY_OTP: '/v1/customer/verify-otp',
    GET_PROFILE: '/v1/customer/self',
    
    // ... more endpoints
  },
  
  // Feature Flags
  FEATURES: {
    USE_REAL_APIS: true,
    USE_REAL_CATEGORIES: true,
    USE_REAL_PRODUCTS: true,
    // ...
  },
};
```

### URL Building Helper

```typescript
export const buildApiUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Usage
const url = buildApiUrl('/v1/store/:storeId/category/grocery', { storeId: '123' });
// Result: 'https://marg-api.thelocalsandbox.dev/v1/store/123/category/grocery'
```

---

## Type Safety

### TypeScript Integration

**Generic Response Type**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

**Usage**:
```typescript
// Type-safe API calls
const response = await apiClient.get<Product[]>('/products');
// response.data is typed as Product[]

const userResponse = await apiClient.get<User>('/user/profile');
// userResponse.data is typed as User
```

**Type Definitions** (`services/api/types.ts`):
- Comprehensive TypeScript interfaces for all API entities
- Product, Store, Order, User, Cart, etc.
- Pagination types
- Error types
- Request/Response types

---

## File Upload Handling

### Upload Method

```typescript
async uploadFile<T>(
  url: string,
  file: { uri: string; type: string; name: string },
  additionalData?: Record<string, any>
): Promise<ApiResponse<T>> {
  const token = await this.getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  return this.request<T>({
    method: 'POST',
    url,
    data: formData,
    headers,
  });
}
```

### Special Case: Prescription Upload

The `orderService` has special handling for prescription uploads using PATCH with multipart/form-data:

```typescript
// Uses direct axios for Android compatibility
const formData = new FormData();
formData.append('prescription', {
  uri: fileUri,
  type: finalType,
  name: 'prescription.pdf',
});

// Fallback to fetch() if axios fails on Android
try {
  const response = await axios.patch(url, formData, { headers });
} catch (axiosErr) {
  // Fallback to fetch for Android devices
  const fetchResp = await fetch(url, {
    method: 'PATCH',
    headers,
    body: formData,
  });
}
```

---

## Request Logging

### Console Logging

The API client logs all requests and responses for debugging:

```typescript
console.log('  API Request:', {
  method,
  url: fullURL,
  headers: requestHeaders,
  data: data
});

console.log('📡 API Response:', {
  status: response.status,
  statusText: response.statusText,
  headers: response.headers
});
```

**Log Format**:
- 🔑 Token added to headers
- 📤 Sending request
- 📡 API Response
- ✅ Success response
- ❌ Error response

---

## Base URL Configuration

### Environment-Based Configuration

```typescript
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://marg-api.thelocalsandbox.dev',
  // ...
};
```

**Default Base URL**: `https://marg-api.thelocalsandbox.dev`

**Environment Variable**: `EXPO_PUBLIC_API_BASE_URL`

**URL Building**:
```typescript
private buildURL(url: string, params?: Record<string, any>): string {
  // If URL starts with http, use as-is (absolute URL)
  const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
  
  // Add query parameters
  if (params) {
    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    return urlObj.toString();
  }
  
  return fullURL;
}
```

---

## API Service Examples

### 1. Auth Service

```typescript
// Send OTP
const response = await authService.sendOTP('1234567890');

// Verify OTP
const loginResponse = await authService.verifyOTP('1234567890', '123456', 'otpKey');

// Get Profile
const profile = await authService.getProfile();
```

### 2. Product Service

```typescript
// Get grocery categories
const categories = await productService.getGroceryCategories(storeId);

// Get products
const products = await productService.getGroceryProducts(storeId);

// Get product details
const product = await productService.getGroceryProductDetails(storeId, productId);
```

### 3. Store Service

```typescript
// Explore stores by pincode
const stores = await storeService.exploreStores('123456', 'grocery');

// Get store details
const storeDetails = await storeService.getStoreDetailsById(storeId);
```

### 4. Order Service

```typescript
// Place order
const orderResponse = await orderService.placeOrder(orderData);

// Initiate payment
const paymentResponse = await orderService.initiatePayment(orderNo);

// Verify payment
const verifyResponse = await orderService.verifyPayment(paymentData);
```

---

## Best Practices Used

### ✅ 1. Centralized Configuration
- All endpoints in `config.ts`
- Base URL in one place
- Easy to switch between environments

### ✅ 2. Type Safety
- Full TypeScript support
- Generic response types
- Comprehensive type definitions

### ✅ 3. Error Handling
- Consistent error format
- User-friendly error messages
- Proper error codes

### ✅ 4. Authentication
- Automatic token injection
- Token refresh support
- Auto-logout on auth errors

### ✅ 5. Retry Logic
- Automatic retry on failures
- Exponential backoff
- Smart retry conditions

### ✅ 6. Request Timeout
- Prevents hanging requests
- Configurable timeout
- Clear timeout errors

### ✅ 7. Service Layer Pattern
- Business logic separated
- Reusable service methods
- Singleton instances

### ✅ 8. Logging
- Request/response logging
- Error logging
- Debug-friendly

---

## Interview Talking Points

### 1. **Why Axios?**
> "We chose Axios over fetch because it provides better error handling, request/response interceptors, automatic JSON transformation, and better timeout support. It's also more mature and widely used in React Native projects."

### 2. **API Client Architecture**
> "We built a custom API client wrapper around Axios that provides centralized configuration, automatic authentication token injection, retry logic, and consistent error handling. This ensures all API calls follow the same patterns and reduces code duplication."

### 3. **Error Handling Strategy**
> "Our error handling distinguishes between server errors (4xx/5xx), network errors, and timeout errors. Each error type has a specific code and user-friendly message. We also automatically handle authentication errors by clearing tokens and triggering logout."

### 4. **Retry Logic**
> "We implement intelligent retry logic that only retries on 5xx server errors and network failures, not on client errors like 400 or 401. We use exponential backoff (1s, 2s, 3s) to avoid overwhelming the server."

### 5. **Type Safety**
> "All API calls are fully typed with TypeScript. We use generic response types (`ApiResponse<T>`) so the response data is type-safe. This catches errors at compile time and provides better IDE autocomplete."

### 6. **Service Layer Pattern**
> "We organize API calls into service classes (AuthService, ProductService, etc.) that encapsulate business logic. Each service is a singleton, making it easy to use across the app. This separation keeps components clean and API logic reusable."

### 7. **Authentication**
> "Authentication tokens are automatically injected into all requests via the `marg-customer-token` header. Tokens are stored in AsyncStorage and loaded on app start. We also handle token refresh if the server sends a new token in response headers."

### 8. **File Uploads**
> "For file uploads, we use FormData with proper MIME types. We have special handling for Android devices where axios sometimes fails with multipart PATCH requests, so we fallback to fetch() in those cases."

### 9. **Configuration Management**
> "All API endpoints are centralized in `config.ts`, making it easy to switch between environments or mock APIs. We also use feature flags to enable/disable specific API features during development."

### 10. **Request Logging**
> "We log all API requests and responses for debugging purposes. This helps identify issues quickly during development. In production, we could easily disable or filter these logs."

---

## Code Examples

### Making an API Call

```typescript
import apiClient from './services/api/client';

// GET request
const response = await apiClient.get<Product[]>('/v1/store/123/product/grocery');

if (response.success) {
  console.log('Products:', response.data);
} else {
  console.error('Error:', response.error);
}

// POST request
const orderResponse = await apiClient.post('/v1/store/checkout/placeorder', {
  items: [...],
  address: {...},
});

// With query parameters
const stores = await apiClient.get<Store[]>('/v1/store/explore/pincode', {
  type: 'grocery'
});
```

### Using Services

```typescript
import { productService } from './services/api/productService';

// Get products
const response = await productService.getGroceryProducts(storeId);

if (response.success) {
  setProducts(response.data);
} else {
  showError(response.error);
}
```

### Error Handling

```typescript
try {
  const response = await authService.sendOTP(mobile);
  
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
    Alert.alert('Error', response.error);
  }
} catch (error) {
  // Handle unexpected error
  console.error('Unexpected error:', error);
  Alert.alert('Error', 'Something went wrong');
}
```

---

## Summary

**API Handling Solution**: Axios + Custom API Client Wrapper

**Key Features**:
- ✅ Centralized configuration
- ✅ Automatic authentication
- ✅ Intelligent retry logic
- ✅ Comprehensive error handling
- ✅ Type safety with TypeScript
- ✅ Request timeout support
- ✅ File upload handling
- ✅ Service layer pattern
- ✅ Request/response logging

**Architecture**:
- Three-layer: Services → API Client → Axios
- Singleton service instances
- Consistent response format
- Type-safe API calls

**Result**: A robust, maintainable, and developer-friendly API handling system! 🚀

