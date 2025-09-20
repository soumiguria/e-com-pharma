# Centralized API Configuration System

## 🎯 Overview
This system allows you to control all API endpoints and features from a single configuration file. You can easily switch between real APIs and mock data without changing any component code.

## 📁 Configuration File
**Location:** `services/api/config.ts`

## 🔧 How to Use

### 1. **Enable/Disable All APIs**
```typescript
// In services/api/config.ts
FEATURES: {
  USE_REAL_APIS: true, // Set to false to use only mock data
  USE_REAL_CATEGORIES: true,
  USE_REAL_PRODUCTS: true,
  USE_REAL_BANNERS: true,
  USE_REAL_AUTH: true,
  USE_REAL_ADDRESSES: true,
  USE_REAL_CART: true,
  USE_REAL_ORDERS: true,
}
```

### 2. **Change API Endpoints**
```typescript
// In services/api/config.ts
ENDPOINTS: {
  // Grocery APIs
  GROCERY_CATEGORIES: '/v1/store/:storeId/category/grocery',
  GROCERY_PRODUCTS: '/v1/store/:storeId/product/grocery',
  
  // Pharma APIs  
  PHARMA_CATEGORIES: '/v1/store/:storeId/category/pharma',
  PHARMA_PRODUCTS: '/v1/store/:storeId/product/pharma',
  
  // Auth APIs
  SEND_OTP: '/v1/customer/send-otp',
  VERIFY_OTP: '/v1/customer/verify-otp',
  // ... more endpoints
}
```

### 3. **Change Base URL**
```typescript
// In services/api/config.ts
BASE_URL: 'https://your-new-api-domain.com',
```

## 🚀 Quick Start Guide

### **To Use Only Mock Data:**
```typescript
// In services/api/config.ts
FEATURES: {
  USE_REAL_APIS: false, // This disables all real APIs
  // ... other features will be ignored
}
```

### **To Use Real APIs:**
```typescript
// In services/api/config.ts
FEATURES: {
  USE_REAL_APIS: true, // This enables real APIs
  USE_REAL_CATEGORIES: true,
  USE_REAL_PRODUCTS: true,
  // ... enable specific features
}
```

### **To Change API Endpoints:**
```typescript
// In services/api/config.ts
ENDPOINTS: {
  GROCERY_CATEGORIES: '/api/v2/stores/:storeId/grocery/categories',
  PHARMA_CATEGORIES: '/api/v2/stores/:storeId/pharma/categories',
  // ... update any endpoint
}
```

##    What Gets Affected

### **HomeScreen Components:**
-  **CategoryGrid** - Categories from API/mock
-  **HorizontallyScrollableSection** - Products from API/mock  
-  **BrandsGrid** - Brands from API/mock
-  **BannerSlider** - Banners from API/mock

### **Other Screens:**
-  **CategoriesScreen** - Categories from API/mock
-  **AllProductsScreen** - Products from API/mock
-  **ProductDetailScreen** - Product details from API/mock
-  **Auth Screens** - Login/Register from API/mock

## 🔍 Console Logging

The system provides detailed console logs to show data sources:

```
🔄 Fetching grocery categories for store: store123
 Grocery categories loaded from API
   Using fallback mock data for grocery categories
  Grocery categories API error: Network error
```

## 🎛️ Feature Flags Explained

| Flag | Description | Affects |
|------|-------------|---------|
| `USE_REAL_APIS` | Master switch for all APIs | Everything |
| `USE_REAL_CATEGORIES` | Categories API | CategoryGrid, CategoriesScreen |
| `USE_REAL_PRODUCTS` | Products API | Product lists, details |
| `USE_REAL_BANNERS` | Banners API | BannerSlider |
| `USE_REAL_AUTH` | Authentication API | Login, Register, Profile |
| `USE_REAL_ADDRESSES` | Address API | Address management |
| `USE_REAL_CART` | Cart API | Shopping cart |
| `USE_REAL_ORDERS` | Orders API | Order management |

## 🔄 How It Works

1. **API Call Attempt**: System tries to call real API
2. **Feature Check**: Checks if feature is enabled
3. **Success**: Returns real data
4. **Failure**: Falls back to mock data
5. **Logging**: Shows data source in console

## 📝 Example: Adding New API

### 1. Add endpoint to config:
```typescript
ENDPOINTS: {
  NEW_FEATURE: '/v1/new-feature/:param',
}
```

### 2. Add feature flag:
```typescript
FEATURES: {
  USE_REAL_NEW_FEATURE: true,
}
```

### 3. Use in service:
```typescript
if (!isApiEnabled('USE_REAL_NEW_FEATURE')) {
  console.log('   API disabled, using fallback mock data');
  throw new Error('API_DISABLED');
}

const url = buildApiUrl(API_CONFIG.ENDPOINTS.NEW_FEATURE, { param: 'value' });
const response = await apiClient.get(url);
```

## 🎯 Benefits

-  **Single Point of Control**: All APIs controlled from one file
-  **Easy Testing**: Switch between real/mock data instantly
-  **Development Friendly**: Mock data always available
-  **Production Ready**: Real APIs when needed
-  **Clear Logging**: Know exactly where data comes from
-  **No Code Changes**: Components work with both real and mock data

## 🚨 Important Notes

1. **Mock Data Always Available**: Even when APIs fail, app continues working
2. **Console Logs**: Check console to see data sources
3. **Feature Flags**: Individual features can be enabled/disabled
4. **No Breaking Changes**: Existing components work without modification

## 🔧 Troubleshooting

### **API Not Working:**
1. Check `USE_REAL_APIS: true` in config
2. Check specific feature flag is enabled
3. Check console logs for errors
4. Verify endpoint URLs are correct

### **Mock Data Not Showing:**
1. Check `USE_REAL_APIS: false` in config
2. Check console logs for "API disabled" messages
3. Verify mock data exists in components

### **Mixed Data Sources:**
1. Check individual feature flags
2. Some features can use real APIs while others use mock
3. Console logs will show which is which 