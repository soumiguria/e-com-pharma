# Deep Linking Implementation - Complete Interview Guide

## 📋 Table of Contents
1. [What is Deep Linking?](#what-is-deep-linking)
2. [Architecture Overview](#architecture-overview)
3. [URL Formats Supported](#url-formats-supported)
4. [Implementation Details](#implementation-details)
5. [Flow Diagrams](#flow-diagrams)
6. [Key Components](#key-components)
7. [Configuration](#configuration)
8. [Interview Talking Points](#interview-talking-points)

---

## What is Deep Linking?

**Deep linking** allows users to open your mobile app directly to a specific screen or content using a URL, rather than always starting from the home screen. In this e-commerce app, deep linking enables:

- **QR Code Scanning**: Users scan a QR code at a physical store and the app opens directly to that store's page
- **Shareable Store Links**: Store owners can share links that take users directly to their store
- **Marketing Campaigns**: Links in emails, SMS, or social media can open specific stores or products
- **Seamless User Experience**: Users skip the pincode entry and store selection screens when coming from a deep link

### Types of Deep Links in This App:
1. **Custom Scheme URLs**: `ecomm://store/abc123` (works when app is installed)
2. **Universal Links (HTTPS)**: `https://stores.yourdomain.com/store/abc123` (works even if app isn't installed - opens web page)
3. **Shortened URLs**: `https://qr.ecomm.com/s/abc123` (optimized for QR codes)

---

## Architecture Overview

The deep linking system follows a **layered architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│  (QR Scan / Link Click / Share)                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Platform Layer (Android/iOS)               │
│  - Intent Filters (Android) / URL Schemes (iOS)         │
│  - App.json configuration                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         React Navigation Linking Configuration          │
│  - NavigationContainer with linking config              │
│  - URL prefixes registered                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              DeepLinkHandler Component                   │
│  - Listens for URL events                               │
│  - Handles initial and runtime deep links               │
│  - Coordinates with contexts                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│           DeepLinkingService (Core Logic)                │
│  - Parses URLs                                           │
│  - Extracts store IDs and parameters                     │
│  - Fetches store details from API                        │
│  - Generates deep link URLs                              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              App Context & Navigation                    │
│  - Sets selected store in AppContext                    │
│  - Navigates to Main screen                             │
│  - Updates UI with store data                            │
└─────────────────────────────────────────────────────────┘
```

---

## URL Formats Supported

### 1. Custom Scheme URLs
```
ecomm://store/{storeId}
paaskidukaan://store/{storeId}
```
- **Use Case**: Direct app-to-app linking when app is installed
- **Example**: `ecomm://store/abc123`
- **Pros**: Fast, no network required
- **Cons**: Only works if app is installed

### 2. HTTPS Universal Links
```
https://stores.yourdomain.com/store/{storeId}
https://ecomm-stores.com/store/{storeId}
```
- **Use Case**: Web fallback, works even if app isn't installed
- **Example**: `https://stores.yourdomain.com/store/abc123?type=grocery&name=My%20Store`
- **Pros**: Universal, works everywhere
- **Cons**: Requires network connection

### 3. Shortened QR Code URLs
```
https://qr.ecomm.com/s/{storeId}
```
- **Use Case**: Optimized for QR codes (shorter = easier to scan)
- **Example**: `https://qr.ecomm.com/s/abc123?type=grocery`
- **Pros**: Compact, QR-code friendly
- **Cons**: Requires URL shortening service

### 4. API Domain Deep Links
```
https://marg-api.thelocalsandbox.dev/dl/{storeId}
```
- **Use Case**: Direct API-based deep links
- **Example**: `https://marg-api.thelocalsandbox.dev/dl/abc123`
- **Pros**: Direct integration with backend
- **Cons**: Exposes API structure

### URL Parameters Supported:
- `type`: Store type (`grocery` or `pharma`)
- `name`: Store name (URL encoded)
- **Example**: `https://stores.yourdomain.com/store/abc123?type=grocery&name=My%20Store`

---

## Implementation Details

### 1. Platform Configuration (`app.json`)

**Android Intent Filters** (lines 40-77):
```json
"intentFilters": [
  {
    "action": "VIEW",
    "data": [
      {
        "scheme": "paaskidukaan",
        "host": "*"
      },
      {
        "scheme": "ecomm",
        "host": "store"
      },
      {
        "scheme": "https",
        "host": "stores.yourdomain.com",
        "pathPrefix": "/store"
      },
      {
        "scheme": "https",
        "host": "qr.ecomm.com",
        "pathPrefix": "/s"
      },
      {
        "scheme": "https",
        "host": "marg-api.thelocalsandbox.dev",
        "pathPrefix": "/dl"
      }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

**Key Points:**
- `BROWSABLE`: Allows links to be opened from browsers
- `DEFAULT`: Makes the app a default handler for these URLs
- Multiple schemes support different use cases
- `pathPrefix` ensures only specific paths trigger the app

**iOS Configuration:**
- Handled automatically by Expo's `scheme` field: `"scheme": "paaskidukaan"`
- Universal Links require additional server-side configuration (Apple App Site Association file)

### 2. Navigation Container Configuration (`App.tsx`)

```typescript
const linking = React.useMemo<LinkingOptions<RootStackParamList>>(() => ({
  prefixes: [
    'paaskidukaan://',
    'ecomm://',
    'https://stores.yourdomain.com',
    'https://qr.ecomm.com',
    'https://ecomm-stores.com',
    'https://marg-api.thelocalsandbox.dev'
  ],
  config: {
    screens: {
      Splash: 'splash',
      Pincode: 'pincode',
      StoreList: 'store-list',
      AboutStore: {
        path: 'store/:storeId',
        parse: {
          storeId: (storeId: string) => storeId,
        },
      },
    },
  },
  // Custom handler - delegates to DeepLinkHandler
  getStateFromPath: (path, options) => {
    return undefined; // Let DeepLinkHandler handle it
  },
}), []);
```

**Key Design Decision:**
- `getStateFromPath` returns `undefined` to prevent React Navigation from auto-navigating
- This allows `DeepLinkHandler` to have full control over the navigation flow
- Enables custom logic like fetching store details before navigation

### 3. DeepLinkHandler Component (`components/deepLink/DeepLinkHandler.tsx`)

**Responsibilities:**
1. **Listen for deep links** (both initial and runtime)
2. **Parse and validate** deep link URLs
3. **Fetch store details** from API
4. **Update app context** with selected store
5. **Navigate** to appropriate screen
6. **Handle errors** gracefully

**Key Features:**

#### a) Dual Listener Setup
```typescript
// Direct React Native Linking listener
const directListener = Linking.addEventListener('url', ({ url }) => {
  handleDeepLink(url);
});

// Service-based listener (backup)
const unsubscribe = deepLinkingService.addDeepLinkListener(handleDeepLink);
```

**Why two listeners?**
- Direct listener catches all URL events immediately
- Service listener provides additional abstraction layer
- Ensures no deep links are missed

#### b) Initial Deep Link Handling
```typescript
const handleInitialDeepLink = async () => {
  const initialUrl = await deepLinkingService.getInitialURL();
  if (initialUrl) {
    const deepLinkResult = deepLinkingService.parseDeepLink(initialUrl);
    if (deepLinkResult.type !== 'unknown') {
      setIsDeepLinkProcessing(true);
      await processDeepLink(initialUrl, true); // isInitial = true
      setHasProcessedInitialDeepLink(true);
    }
  }
};
```

**Why `isInitial` flag?**
- Initial deep links need special handling (app just started)
- Must bypass splash screen navigation
- Uses `navigation.reset()` instead of `navigate()` to clear navigation stack

#### c) Processing Guard
```typescript
const isProcessingRef = useRef(false);

const processDeepLink = async (url: string, isInitial = false) => {
  if (isProcessingRef.current) {
    console.log('🔗 Deep link already being processed, ignoring:', url);
    return;
  }
  isProcessingRef.current = true;
  // ... process deep link
  isProcessingRef.current = false;
};
```

**Why this guard?**
- Prevents race conditions when multiple deep links arrive simultaneously
- Ensures only one deep link is processed at a time
- Uses `useRef` instead of state (doesn't trigger re-renders)

#### d) Store Deep Link Processing
```typescript
const handleStoreDeepLink = async (params, isInitial = false) => {
  // 1. Fetch store details from API
  const storeDetails = await fetchStoreDetails(params.storeId);
  
  if (storeDetails) {
    // 2. Create store object
    const newStore = {
      id: params.storeId,
      name: storeDetails.name || params.storeName || 'Selected Store',
      address: storeDetails.address || '',
      type: storeDetails.type || params.storeType || 'grocery',
      pincode: storeDetails.pincode
    };
    
    // 3. Update app context
    setSelectedStore(newStore);
    saveLastVisitedStore(newStore);
    
    // 4. Navigate to Main screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  } else {
    // Fallback: Use URL parameters if API fails
    const fallbackStore = {
      id: params.storeId,
      name: params.storeName || 'Selected Store',
      type: params.storeType || 'grocery',
    };
    setSelectedStore(fallbackStore);
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }
};
```

**Key Points:**
- **API-first approach**: Tries to fetch complete store details
- **Fallback mechanism**: Uses URL parameters if API fails
- **Context update**: Sets store in AppContext so all screens can access it
- **Navigation reset**: Clears navigation stack to prevent back button issues

### 4. DeepLinkingService (`services/deepLinkingService.ts`)

**Core Service Class** - Singleton pattern (exported as instance)

#### a) URL Parsing (`parseDeepLink`)
```typescript
parseDeepLink(url: string): DeepLinkResult {
  const parsed = Linking.parse(url);
  
  // Custom scheme: ecomm://store/{storeId}
  if (parsed.scheme === 'ecomm' || parsed.scheme === 'paaskidukaan') {
    if (parsed.hostname === 'store' && parsed.path) {
      const storeId = parsed.path.replace('/', '');
      return { type: 'store', params: { storeId }, originalUrl: url };
    }
  }
  
  // HTTPS URLs: https://stores.yourdomain.com/store/{storeId}
  if (parsed.scheme === 'https') {
    // Pattern: /store/{storeId}
    const storeMatch = path.match(/^\/store\/(.+)$/);
    if (storeMatch) {
      return { type: 'store', params: { storeId: storeMatch[1], ... }, originalUrl: url };
    }
    
    // Pattern: /s/{storeId} (shortened)
    const shortMatch = path.match(/^\/s\/(.+)$/);
    // Pattern: /dl/{storeId} (API domain)
    const dlMatch = path.match(/^\/dl\/(.+)$/);
  }
  
  return { type: 'unknown', originalUrl: url };
}
```

**Regex Patterns Explained:**
- `/^\/store\/(.+)$/`: Matches `/store/` followed by one or more characters (storeId)
- `/^\/s\/(.+)$/`: Matches `/s/` followed by storeId (shortened format)
- `/^\/dl\/(.+)$/`: Matches `/dl/` followed by storeId (API format)

#### b) Parameter Extraction
```typescript
private extractStoreTypeFromUrl(url: string): 'grocery' | 'pharma' | undefined {
  const urlObj = new URL(url);
  
  // Check query parameters: ?type=grocery
  const type = urlObj.searchParams.get('type');
  if (type === 'grocery' || type === 'pharma') {
    return type;
  }
  
  // Check path: /store/grocery/{storeId}
  if (url.includes('/grocery/')) return 'grocery';
  if (url.includes('/pharma/')) return 'pharma';
  
  return undefined;
}
```

#### c) Store Details Fetching
```typescript
async fetchStoreDetails(storeId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const response = await fetch(`${this.apiBaseUrl}/dl/${storeId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  
  if (response.ok) {
    const data = await response.json();
    return { success: true, data: data.data };
  } else {
    return { success: false, error: `HTTP ${response.status}` };
  }
}
```

**API Endpoint**: `GET https://marg-api.thelocalsandbox.dev/dl/{storeId}`
- Returns store details (name, address, type, pincode, etc.)
- Used to enrich deep link data with complete store information

#### d) Deep Link Generation
```typescript
generateStoreDeepLink(storeId: string, storeType?: 'grocery' | 'pharma', storeName?: string): {
  customScheme: string;
  httpsUrl: string;
  qrUrl: string;
} {
  const baseParams = storeType ? `?type=${storeType}` : '';
  const nameParam = storeName ? `${baseParams ? '&' : '?'}name=${encodeURIComponent(storeName)}` : '';
  const queryParams = baseParams + nameParam;

  return {
    customScheme: `ecomm://store/${storeId}`,
    httpsUrl: `https://stores.yourdomain.com/store/${storeId}${queryParams}`,
    qrUrl: `https://qr.ecomm.com/s/${storeId}${queryParams}`
  };
}
```

**Use Case**: Store owners can generate deep links for their stores
- Used in QR code generation
- Used in share functionality
- Returns all three formats for maximum compatibility

### 5. DeepLinkContext (`contexts/DeepLinkContext.tsx`)

**Purpose**: Coordinate deep link processing state across components

```typescript
interface DeepLinkContextType {
  isDeepLinkProcessing: boolean;        // Is a deep link currently being processed?
  setIsDeepLinkProcessing: (processing: boolean) => void;
  hasProcessedInitialDeepLink: boolean;  // Has the initial deep link been handled?
  setHasProcessedInitialDeepLink: (processed: boolean) => void;
}
```

**Used By:**
- **SplashScreen**: Waits for deep link processing before navigating
- **DeepLinkHandler**: Updates processing state

**Why needed?**
- Prevents race conditions between splash screen and deep link handler
- Ensures splash screen doesn't navigate away while deep link is processing
- Provides coordination mechanism for app initialization

### 6. SplashScreen Integration (`screens/auth/SplashScreen.tsx`)

```typescript
const { isDeepLinkProcessing, hasProcessedInitialDeepLink } = useDeepLinkContext();

useEffect(() => {
  const timer = setTimeout(() => {
    // Wait if deep link is being processed
    if (isDeepLinkProcessing) {
      return; // Don't navigate yet
    }

    // If deep link processed and store selected, navigate to Main
    if (hasProcessedInitialDeepLink && selectedStore) {
      navigation.replace('Main', undefined as any);
      return;
    }

    // Normal flow: check auth and navigate accordingly
    if (!isLoading) {
      if (isAuthenticated && lastVisitedStore) {
        navigation.replace('Main');
      } else {
        navigation.replace('Pincode');
      }
    }
  }, 2000);
}, [isDeepLinkProcessing, hasProcessedInitialDeepLink, selectedStore, ...]);
```

**Key Logic:**
1. **Wait for deep link**: If processing, don't navigate
2. **Deep link success**: If processed and store selected, go to Main
3. **Normal flow**: Check auth and navigate accordingly

---

## Flow Diagrams

### Flow 1: App Installed - Deep Link Opens App

```
User clicks link: ecomm://store/abc123
         │
         ▼
Android/iOS intercepts URL
         │
         ▼
App opens (if not running) or brings to foreground
         │
         ▼
NavigationContainer receives URL
         │
         ▼
DeepLinkHandler listener fires
         │
         ▼
handleInitialDeepLink() called
         │
         ▼
DeepLinkingService.parseDeepLink(url)
         │
         ├─► Extracts: storeId = "abc123"
         │
         ▼
DeepLinkingService.fetchStoreDetails("abc123")
         │
         ├─► API Call: GET /dl/abc123
         │
         ▼
Store details received
         │
         ▼
AppContext.setSelectedStore(store)
         │
         ▼
SplashScreen detects hasProcessedInitialDeepLink = true
         │
         ▼
Navigation.reset({ routes: [{ name: 'Main' }] })
         │
         ▼
HomeScreen displays store products
```

### Flow 2: App Running - Deep Link Received

```
User clicks link while app is running
         │
         ▼
Linking.addEventListener('url') fires
         │
         ▼
handleDeepLink(url) called
         │
         ▼
processDeepLink(url, isInitial=false)
         │
         ├─► Check: isProcessingRef.current?
         │   └─► If true, ignore (prevent race condition)
         │
         ▼
Parse URL and fetch store details
         │
         ▼
Update AppContext with new store
         │
         ▼
Navigation.reset({ routes: [{ name: 'Main' }] })
         │
         ▼
HomeScreen updates with new store
```

### Flow 3: App Not Installed - Universal Link

```
User clicks: https://stores.yourdomain.com/store/abc123
         │
         │
         ├─► App installed?
         │   └─► YES: Opens app (Flow 1)
         │
         └─► NO: Opens in browser
                 │
                 ▼
         Web page shows store info
                 │
                 ▼
         "Download App" buttons
                 │
                 ├─► Play Store (Android)
                 └─► App Store (iOS)
```

---

## Key Components

### File Structure
```
├── app.json                          # Platform configuration
├── App.tsx                           # NavigationContainer + DeepLinkHandler setup
├── components/
│   └── deepLink/
│       └── DeepLinkHandler.tsx      # Main handler component
├── services/
│   └── deepLinkingService.ts        # Core parsing & API logic
├── contexts/
│   └── DeepLinkContext.tsx          # State coordination
├── utils/
│   └── storeDeepLinkGenerator.ts    # QR code & link generation
└── screens/
    └── auth/
        └── SplashScreen.tsx         # Initial navigation logic
```

### Component Hierarchy
```
App
└── NavigationContainer
    └── NativeBaseProvider
        └── AppProvider
            └── StorageProvider
                └── CartProvider
                    └── ToastProvider
                        └── DeepLinkProvider
                            └── ErrorBoundary
                                └── DeepLinkHandler  ← Handles all deep links
                                    └── AppNavigator
                                        └── SplashScreen (checks deep link state)
```

---

## Configuration

### Android Intent Filters
Located in `app.json` → `android.intentFilters`

**Purpose**: Tells Android which URLs the app can handle

**Key Attributes:**
- `action: "VIEW"`: Handle URL viewing intents
- `category: "BROWSABLE"`: Can be opened from browsers
- `category: "DEFAULT"`: App can be default handler
- `scheme`: URL scheme (ecomm, https, etc.)
- `host`: Domain or hostname
- `pathPrefix`: URL path prefix to match

### iOS URL Schemes
- Configured via `app.json` → `expo.scheme: "paaskidukaan"`
- Universal Links require server-side configuration (not shown in code)

### React Navigation Linking
- `prefixes`: List of URL prefixes app handles
- `config.screens`: Maps URL paths to screen names
- `getStateFromPath`: Custom handler (returns undefined to delegate)

---

## Interview Talking Points

### 1. **Why Deep Linking?**
> "We implemented deep linking to enable QR code scanning at physical stores. When customers scan a store's QR code, they're taken directly to that store's page in the app, skipping the pincode entry and store selection screens. This creates a seamless offline-to-online bridge and improves user experience."

### 2. **Architecture Decision: Why Custom Handler?**
> "We chose to use a custom DeepLinkHandler component instead of relying solely on React Navigation's built-in linking because we needed to:
> - Fetch store details from our API before navigation
> - Update app context with store information
> - Handle errors gracefully with fallback mechanisms
> - Coordinate with the splash screen to prevent navigation conflicts"

### 3. **Multiple URL Formats - Why?**
> "We support multiple URL formats for different use cases:
> - **Custom schemes** (`ecomm://`) for fast app-to-app linking
> - **HTTPS URLs** for universal links that work even if the app isn't installed
> - **Shortened URLs** (`/s/`) optimized for QR codes
> - **API domain links** for direct backend integration
> 
> This provides maximum compatibility and flexibility."

### 4. **Race Condition Prevention**
> "We use a `useRef` guard (`isProcessingRef`) to prevent multiple simultaneous deep link processing. This ensures that if multiple deep links arrive at the same time, only one is processed. We also coordinate with the splash screen using DeepLinkContext to prevent navigation conflicts during app initialization."

### 5. **Error Handling & Fallbacks**
> "Our deep linking has multiple fallback layers:
> 1. If API fetch fails, we use URL parameters (storeId, storeName, storeType)
> 2. If store not found, we show an alert with option to browse stores
> 3. If app not installed, universal links open a web page with app store links
> 4. Unknown URLs are silently ignored (no error shown to user)"

### 6. **Performance Considerations**
> "We optimize performance by:
> - Using `useRef` instead of state for processing guard (no re-renders)
> - Memoizing the linking configuration in App.tsx
> - Fetching store details asynchronously while showing loading state
> - Using `navigation.reset()` to clear stack and prevent memory issues"

### 7. **Testing Deep Links**
> "To test deep links:
> - **Android**: `adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.paaskidukaan.app`
> - **iOS**: Open Safari and type `ecomm://store/test123`
> - **Development**: Use Expo's `Linking.openURL()` in code
> - **Production**: Test with actual QR codes and share links"

### 8. **Security Considerations**
> "We validate deep links by:
> - Checking URL format matches expected patterns
> - Verifying store IDs exist in our database
> - Using HTTPS for universal links (encrypted)
> - Validating store details from trusted API endpoint
> - Ignoring unknown/malformed URLs silently"

### 9. **Future Enhancements**
> "Potential improvements:
> - Support product deep links (`ecomm://product/{productId}`)
> - Support category deep links (`ecomm://category/{categoryId}`)
> - Analytics tracking for deep link usage
> - A/B testing different URL formats
> - Branch.io or Firebase Dynamic Links integration for better analytics"

### 10. **Challenges Solved**
> "Key challenges we solved:
> 1. **Navigation timing**: Coordinated splash screen with deep link processing
> 2. **Race conditions**: Used refs and context to prevent conflicts
> 3. **API failures**: Implemented fallback to URL parameters
> 4. **Multiple URL formats**: Created flexible parser supporting various patterns
> 5. **App state**: Handled both initial (app closed) and runtime (app open) deep links"

---

## Code Snippets for Quick Reference

### Testing Deep Links
```typescript
// In development, test deep links:
import * as Linking from 'expo-linking';

// Test custom scheme
Linking.openURL('ecomm://store/test123');

// Test HTTPS URL
Linking.openURL('https://stores.yourdomain.com/store/test123?type=grocery&name=Test%20Store');
```

### Generating Deep Links
```typescript
import deepLinkingService from './services/deepLinkingService';

const links = deepLinkingService.generateStoreDeepLink(
  'store123',
  'grocery',
  'My Store'
);

console.log(links.customScheme); // ecomm://store/store123
console.log(links.httpsUrl);     // https://stores.yourdomain.com/store/store123?type=grocery&name=My%20Store
console.log(links.qrUrl);        // https://qr.ecomm.com/s/store123?type=grocery&name=My%20Store
```

### Manual Deep Link Handling
```typescript
import deepLinkingService from './services/deepLinkingService';

const url = 'ecomm://store/abc123';
const result = deepLinkingService.parseDeepLink(url);

if (result.type === 'store' && result.params) {
  console.log('Store ID:', result.params.storeId);
  // Handle store deep link...
}
```

---

## Summary

Your deep linking implementation is **production-ready** and handles:
- ✅ Multiple URL formats (custom schemes, HTTPS, shortened)
- ✅ Initial and runtime deep links
- ✅ API integration for store details
- ✅ Error handling and fallbacks
- ✅ Race condition prevention
- ✅ Navigation coordination
- ✅ Platform-specific configuration (Android/iOS)
- ✅ QR code generation support

**Key Strengths:**
1. **Robust error handling** with multiple fallback layers
2. **Flexible URL parsing** supporting various formats
3. **Clean architecture** with separation of concerns
4. **Production considerations** (race conditions, state management)
5. **User experience** (seamless navigation, no errors shown for invalid links)

This is a **solid implementation** that demonstrates understanding of:
- React Native deep linking
- Navigation state management
- API integration
- Error handling
- Platform-specific configuration
- User experience design


