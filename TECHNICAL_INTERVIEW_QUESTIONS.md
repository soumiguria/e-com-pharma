# Technical Interview Questions - Paas Ki Dukaan E-Commerce App

## Table of Contents
1. [Architecture & Design Patterns](#architecture--design-patterns)
2. [State Management](#state-management)
3. [React Native & Expo](#react-native--expo)
4. [API Handling & Network](#api-handling--network)
5. [Navigation](#navigation)
6. [Deep Linking](#deep-linking)
7. [Performance Optimization](#performance-optimization)
8. [Authentication & Security](#authentication--security)
9. [Cart Management](#cart-management)
10. [Voice Search Implementation](#voice-search-implementation)
11. [Error Handling](#error-handling)
12. [TypeScript](#typescript)
13. [Testing & Debugging](#testing--debugging)
14. [Code Quality & Best Practices](#code-quality--best-practices)

---

## Architecture & Design Patterns

### Q1: Explain the overall architecture of this e-commerce app. What patterns are used?
**Expected Answer:**
- Three-layer architecture: Service Layer → API Client → Axios
- Context API for state management (7 distinct contexts)
- Component-based architecture with separation of concerns
- Service layer pattern for API calls
- Singleton pattern for API client
- Provider pattern for context management

### Q2: Why was Context API chosen over Redux for state management?
**Expected Answer:**
- Built-in solution, no dependencies
- App has 7 focused contexts (not massive global state)
- Simpler and easier to maintain
- Sufficient performance for app scale
- Works well with AsyncStorage for persistence
- Less boilerplate than Redux

### Q3: How is the codebase organized? Explain the folder structure.
**Expected Answer:**
- `screens/` - Screen components organized by feature
- `components/` - Reusable components organized by feature (cart, product, ui, etc.)
- `contexts/` - State management contexts
- `services/api/` - API service layer with client wrapper
- `navigation/` - Navigation configuration
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `theme/` - Theming configuration

### Q4: What design patterns are implemented in the API client?
**Expected Answer:**
- Singleton pattern (single instance of ApiClient)
- Strategy pattern (retry mechanism)
- Template method pattern (request method)
- Interceptor pattern (headers, error handling)

### Q5: How does the app handle separation of concerns between UI and business logic?
**Expected Answer:**
- Service layer handles all API calls
- Contexts manage state and business logic
- Components are presentational
- Custom hooks encapsulate reusable logic
- Utils contain pure functions

---

## State Management

### Q6: Explain how the CartContext manages state. What happens when you add an item?
**Expected Answer:**
- Uses `useState` for cart items (separate arrays for grocery/pharmacy)
- `useEffect` loads from AsyncStorage on mount
- `useEffect` saves to AsyncStorage on changes
- `addToGroceryCart` checks for existing item, increments quantity or adds new
- State updates trigger AsyncStorage persistence
- Computed values (totals) are calculated on each render

### Q7: How does the app persist state across app restarts?
**Expected Answer:**
- AsyncStorage for persistent data
- Cart items saved to AsyncStorage
- User data and auth token saved
- Last visited store saved
- Loaded on app initialization in `useEffect`

### Q8: What are the different contexts in the app and what does each manage?
**Expected Answer:**
1. **AuthContext** - User authentication, token, user data
2. **CartContext** - Shopping cart items, totals
3. **ThemeContext** - Dark/light theme, app section colors
4. **AppContext** - Selected store, user location, last visited store
5. **StorageContext** - AsyncStorage operations
6. **ToastContext** - Toast notifications
7. **DeepLinkContext** - Deep link processing state

### Q9: How would you prevent unnecessary re-renders when using Context API?
**Expected Answer:**
- Split contexts by domain (already done)
- Use `React.memo` for components
- Use `useMemo` for computed values
- Use `useCallback` for functions passed as props
- Avoid putting frequently changing values in context
- Consider using selectors or splitting contexts further

### Q10: What happens if multiple components update the cart simultaneously?
**Expected Answer:**
- React batches state updates automatically
- `setGroceryItems` uses functional updates (`prevItems => ...`)
- AsyncStorage saves happen in `useEffect` which batches
- No race conditions because React handles batching
- Last write wins for AsyncStorage (but React state is source of truth)

---

## React Native & Expo

### Q11: Why was Expo chosen for this project? What are the benefits?
**Expected Answer:**
- Faster development with managed workflow
- Built-in modules (expo-location, expo-image-picker, etc.)
- Easy builds with EAS
- Over-the-air updates
- Cross-platform (iOS/Android) from single codebase
- Good TypeScript support

### Q12: How does the app handle platform-specific code (iOS vs Android)?
**Expected Answer:**
- Uses `Platform.OS` checks
- Platform-specific permissions (Android PermissionsAndroid, iOS info.plist)
- Platform-specific navigation styles
- Conditional rendering based on platform

### Q13: Explain the navigation structure. How are nested navigators organized?
**Expected Answer:**
- Root Stack Navigator (AppNavigator)
- Bottom Tab Navigator for main screens
- Drawer Navigator for profile
- Stack navigators for feature flows
- Deep linking integrated with NavigationContainer

### Q14: How does the app handle app lifecycle events (foreground/background)?
**Expected Answer:**
- Uses `useFocusEffect` for screen focus
- `useEffect` cleanup for component unmount
- Deep link handling on app start
- AsyncStorage persistence on state changes

### Q15: What Expo modules are used and why?
**Expected Answer:**
- `expo-location` - Store location, nearby stores
- `expo-image-picker` - Prescription uploads
- `expo-av` - Voice recording
- `expo-linking` - Deep linking
- `expo-font` - Custom fonts
- `expo-constants` - App configuration

---

## API Handling & Network

### Q16: Explain the API client architecture. How does it handle errors?
**Expected Answer:**
- Custom ApiClient class wrapping Axios
- Centralized error handling in `handleApiError`
- Retry mechanism for network errors and 5xx errors
- Token management (get/set from AsyncStorage)
- Custom headers (`marg-customer-token`)
- Timeout handling with AbortController
- Returns standardized `ApiResponse<T>` format

### Q17: How does the API client handle authentication tokens?
**Expected Answer:**
- Gets token from AsyncStorage in `getAuthToken()`
- Adds to headers as `marg-customer-token` (not Authorization)
- Handles token refresh if `x-new-token` header present
- Clears token on 401/403 errors
- Token stored after login in AuthContext

### Q18: What is the retry mechanism? When does it retry?
**Expected Answer:**
- Retries up to 3 times (configurable)
- Exponential backoff (delay * attempt number)
- Retries on: 5xx server errors, 429 rate limit, network errors
- Does NOT retry on: 4xx client errors (except 429)
- Uses `shouldRetry()` method to determine

### Q19: How are API responses standardized across the app?
**Expected Answer:**
- All services return `ApiResponse<T>` type
- Format: `{ success: boolean, data?: T, error?: string }`
- Consistent error handling
- Type-safe with TypeScript generics

### Q20: How would you handle offline scenarios in this app?
**Expected Answer:**
- Use NetInfo to detect connectivity
- Queue requests when offline
- Show cached data from AsyncStorage
- Sync when back online
- Show offline indicator to user
- Use React Query or similar for caching

---

## Navigation

### Q21: How is deep linking integrated with React Navigation?
**Expected Answer:**
- `linking` prop in NavigationContainer
- Multiple URL schemes configured (`paaskidukaan://`, `ecomm://`, HTTPS)
- `getStateFromPath` returns undefined to let DeepLinkHandler process
- DeepLinkHandler component wraps AppNavigator
- Uses `Linking.addEventListener` for URL events

### Q22: Explain the navigation flow from Splash to Home screen.
**Expected Answer:**
1. SplashScreen checks auth and location
2. If no store selected → PincodeScreen
3. If no pincode → StoreListScreen
4. After store selection → Main (BottomTabNavigator)
5. HomeScreen shows products for selected store

### Q23: How does the floating cart button know which screen to hide on?
**Expected Answer:**
- Uses `useNavigationState` to get current route
- `getDeepestRouteName` extracts deepest route from nested navigators
- Checks against array of route names to hide on
- Uses safe area insets for positioning

### Q24: What navigation patterns are used for modals and overlays?
**Expected Answer:**
- Stack navigator for full-screen modals
- React Native Modal component for overlays
- Bottom sheet patterns (if implemented)
- Drawer for profile menu

---

## Deep Linking

### Q25: Explain how deep linking works in this app. What URL patterns are supported?
**Expected Answer:**
- Custom schemes: `paaskidukaan://store/{storeId}`, `ecomm://store/{storeId}`
- HTTPS: `https://stores.yourdomain.com/store/{storeId}`
- Short URLs: `https://qr.ecomm.com/s/{storeId}`
- API deep links: `https://marg-api.thelocalsandbox.dev/dl/{storeId}`
- DeepLinkingService parses URLs
- DeepLinkHandler processes and navigates

### Q26: How does the app handle deep links when the app is closed vs. running?
**Expected Answer:**
- **Closed**: `getInitialURL()` gets URL on app start
- **Running**: `Linking.addEventListener` listens for URL events
- Both use same `processDeepLink` function
- Initial deep links use `navigation.reset()` to bypass splash
- Running deep links navigate to Main screen

### Q27: What happens when a deep link points to a non-existent store?
**Expected Answer:**
- Fetches store details from API
- If not found, uses fallback store object
- Still navigates to HomeScreen
- Shows alert if not initial deep link
- User can browse stores as fallback

### Q28: How would you test deep linking functionality?
**Expected Answer:**
- Test with `adb` commands (Android)
- Test with `xcrun simctl` (iOS)
- Test URL schemes in browser
- Test initial URL vs. running app
- Test invalid URLs
- Test store not found scenarios

---

## Performance Optimization

### Q29: What memoization techniques are used in the app?
**Expected Answer:**
- `React.memo` for components (Header, ProductCard)
- `useMemo` for computed values (theme, totals, filtered lists)
- `useCallback` for functions passed as props
- Prevents unnecessary re-renders

### Q30: How is the cart total calculated? Could it be optimized?
**Expected Answer:**
- Currently: `reduce()` on every render
- Could use `useMemo` with dependencies on cart items
- Current approach is fine for small cart sizes
- Would benefit from memoization for large carts

### Q31: How would you optimize image loading in the product list?
**Expected Answer:**
- Use `expo-image` with caching
- Implement lazy loading for FlatList
- Use `getItemLayout` for better performance
- Implement image placeholders
- Compress images on server
- Use CDN for images

### Q32: What performance issues could arise with the current Context API setup?
**Expected Answer:**
- All consumers re-render when context value changes
- Multiple contexts could cause cascading re-renders
- Solution: Split contexts further, use selectors, memoize components
- Consider using libraries like `use-context-selector`

### Q33: How does the app handle large product lists?
**Expected Answer:**
- Uses `FlatList` for virtualization
- `keyExtractor` for efficient rendering
- `initialNumToRender` and `maxToRenderPerBatch`
- Could add pagination/infinite scroll

---

## Authentication & Security

### Q34: Explain the authentication flow in this app.
**Expected Answer:**
1. User enters phone number
2. `sendOTP()` sends OTP via API
3. User enters OTP
4. `verifyOTP()` verifies and gets JWT token
5. Token decoded to get user data
6. User data and token saved to AsyncStorage
7. Token added to API requests via headers

### Q35: How is the JWT token stored and used?
**Expected Answer:**
- Stored in AsyncStorage as `auth_token`
- Decoded using `jwt-decode` library
- Added to API requests as `marg-customer-token` header
- Checked on app start to restore session
- Cleared on logout

### Q36: What security concerns exist with storing tokens in AsyncStorage?
**Expected Answer:**
- AsyncStorage is not encrypted (plain text)
- Vulnerable to root/jailbreak devices
- Should use encrypted storage (react-native-keychain)
- Token expiration should be checked
- Implement token refresh mechanism

### Q37: How does the app handle token expiration?
**Expected Answer:**
- Currently: Token decoded but expiration not actively checked
- Should: Check `exp` field from decoded token
- Should: Implement refresh token mechanism
- Should: Logout user if token expired
- API client should handle 401 responses

### Q38: How is user data refreshed after login?
**Expected Answer:**
- After token decode, calls `authService.getProfile()`
- Updates user data from API response
- Ensures latest user info is displayed
- Falls back to token data if API call fails

---

## Cart Management

### Q39: How are grocery and pharmacy items kept separate in the cart?
**Expected Answer:**
- Separate state arrays: `groceryItems` and `pharmacyItems`
- Separate AsyncStorage keys: `groceryCart` and `pharmacyCart`
- Separate add functions: `addToGroceryCart` and `addToPharmacyCart`
- Category field in CartItem interface

### Q40: What happens when you add the same product twice?
**Expected Answer:**
- `addToGroceryCart` checks for existing item by `id`
- If exists: increments `quantity` by 1
- If new: adds with `quantity: 1`
- Uses functional update: `prevItems => ...`

### Q41: How is the cart total calculated? Show the logic.
**Expected Answer:**
```typescript
const groceryTotal = Math.round(groceryItems.reduce(
  (total, item) => total + (item.quantity > 0 ? item.price * item.quantity : 0),
  0
) * 100) / 100;
```
- Sums `price * quantity` for all items
- Rounds to 2 decimal places
- Separate totals for grocery and pharmacy

### Q42: How would you implement cart persistence across devices?
**Expected Answer:**
- Sync cart to backend API
- Store cart items in user account
- Sync on login/logout
- Merge local and server cart
- Handle conflicts (server wins or merge strategy)

---

## Voice Search Implementation

### Q43: Explain how voice search works in this app.
**Expected Answer:**
1. User taps mic button
2. `startListening()` requests mic permission
3. `Audio.Recording.createAsync()` starts recording
4. User speaks, recording continues
5. `stopListening()` stops recording
6. Audio converted to base64
7. Sent to Google Cloud Speech-to-Text API
8. Transcript returned and used as search query

### Q44: How does the app handle microphone permissions?
**Expected Answer:**
- Android: Uses `PermissionsAndroid.request()`
- iOS: Handled by `Audio.requestPermissionsAsync()`
- Shows permission dialog with explanation
- Returns false if denied (shows red mic icon)
- No alert shown, just visual indicator

### Q45: What happens if the Speech-to-Text API is not configured?
**Expected Answer:**
- `speechToTextService.isConfigured()` checks for API key
- Sets error state if not configured
- Shows error message
- Disables voice search functionality
- Requires `EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY` env variable

### Q46: How is silence detection handled during recording?
**Expected Answer:**
- `silenceTimerRef` tracks silence timeout
- `SILENCE_TIMEOUT` set to 5 seconds
- Timer resets on recording status updates
- Auto-stops recording after 5 seconds of silence
- Prevents infinite recording

---

## Error Handling

### Q47: How are API errors handled throughout the app?
**Expected Answer:**
- ApiClient `handleApiError()` standardizes errors
- Returns `ApiError` with code, message, details
- Network errors vs. server errors handled differently
- Toast notifications for user-facing errors
- Error boundaries for React errors

### Q48: What is the ErrorBoundary component and how does it work?
**Expected Answer:**
- React Error Boundary catches component errors
- Prevents entire app from crashing
- Shows fallback UI on error
- Logs error for debugging
- Wraps app in App.tsx

### Q49: How are network errors different from API errors?
**Expected Answer:**
- **Network errors**: No response from server (timeout, no connection)
  - Code: `NETWORK_ERROR`
  - Message: "Network error occurred..."
- **API errors**: Server responded with error status
  - Code: From response or `HTTP_{status}`
  - Message: From response or default
  - Details: Full response data

### Q50: How would you implement global error handling for unhandled promise rejections?
**Expected Answer:**
- Use `ErrorUtils.setGlobalHandler`
- Log to crash reporting service (Sentry, etc.)
- Show user-friendly error message
- Prevent app crash
- Track error analytics

---

## TypeScript

### Q51: How is TypeScript used in this project? Give examples.
**Expected Answer:**
- All files use `.tsx` or `.ts` extensions
- Interfaces for all data structures
- Type-safe navigation with `RootStackParamList`
- Generic types in API client: `ApiResponse<T>`
- Type guards for runtime type checking

### Q52: Explain the navigation type safety. How does it work?
**Expected Answer:**
- `RootStackParamList` defines all routes and params
- `NativeStackNavigationProp<RootStackParamList>` types navigation
- `RouteProp<RootStackParamList, 'RouteName'>` types route params
- TypeScript ensures correct route names and params
- Prevents navigation errors at compile time

### Q53: How are API response types defined?
**Expected Answer:**
- `ApiResponse<T>` generic interface
- Service functions return typed responses
- Example: `authService.getProfile(): Promise<ApiResponse<UserPayload>>`
- Type inference from service return types
- Type-safe data access

### Q54: What TypeScript utility types are used?
**Expected Answer:**
- `Omit<CartItem, 'quantity' | 'category'>` - Remove properties
- `Partial<RequestOptions>` - Make all properties optional
- `ReactNode` - React children type
- Generics for reusable types

---

## Testing & Debugging

### Q55: How would you test the CartContext?
**Expected Answer:**
- Unit tests for add/remove/update functions
- Test AsyncStorage integration
- Test quantity updates
- Test cart totals calculation
- Test persistence across app restarts
- Use React Testing Library

### Q56: How would you test deep linking?
**Expected Answer:**
- Test URL parsing with different formats
- Test initial URL handling
- Test running app URL handling
- Test invalid URLs
- Test store not found scenario
- Use `Linking.openURL()` in tests

### Q57: What debugging tools and techniques are used?
**Expected Answer:**
- Console.log statements throughout
- React Native Debugger
- Flipper for network inspection
- Expo DevTools
- Error boundaries for error tracking
- Could add: Sentry, LogRocket

### Q58: How would you test the API client retry mechanism?
**Expected Answer:**
- Mock Axios to return errors
- Test retry on 5xx errors
- Test retry on network errors
- Test no retry on 4xx errors
- Test exponential backoff timing
- Verify retry attempts count

---

## Code Quality & Best Practices

### Q59: How is code reusability achieved in this app?
**Expected Answer:**
- Reusable components (ProductCard, SearchBar, etc.)
- Custom hooks (useVoiceSearch, useCart, etc.)
- Service layer for API calls
- Utility functions (priceFormatter, etc.)
- Context providers for shared state

### Q60: What code organization principles are followed?
**Expected Answer:**
- Feature-based folder structure
- Separation of concerns (UI, logic, data)
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Clear naming conventions

### Q61: How are environment variables handled?
**Expected Answer:**
- `EXPO_PUBLIC_*` prefix for public variables
- Used in `process.env.EXPO_PUBLIC_API_BASE_URL`
- API keys in environment variables
- Different configs for dev/staging/prod
- Should not commit secrets to git

### Q62: How would you improve the current codebase?
**Expected Answer:**
- Add unit and integration tests
- Implement proper error logging (Sentry)
- Add loading states consistently
- Implement offline support
- Add analytics tracking
- Improve TypeScript strictness
- Add code documentation
- Implement CI/CD pipeline
- Add performance monitoring

### Q63: How is the theme system implemented?
**Expected Answer:**
- ThemeContext manages theme mode (light/dark)
- Theme object with colors for grocery/pharma sections
- `useMemo` to compute theme based on mode and section
- Themed components use theme from context
- NativeBase integration for component theming

### Q64: How would you implement search functionality?
**Expected Answer:**
- Debounce search input
- Call search API with query
- Show loading state
- Display results in FlatList
- Handle empty results
- Cache recent searches
- Implement search history

### Q65: How does the app handle image loading and caching?
**Expected Answer:**
- Uses `Image` component from React Native
- Could use `expo-image` for better caching
- Images loaded from CDN/API URLs
- No explicit caching strategy visible
- Should implement: image caching, placeholders, error handling

---

## Advanced Questions

### Q66: How would you implement real-time order tracking?
**Expected Answer:**
- WebSocket connection to backend
- Subscribe to order updates
- Update order status in real-time
- Show push notifications
- Update UI when status changes
- Handle connection drops and reconnection

### Q67: How would you optimize the app for low-end devices?
**Expected Answer:**
- Reduce image sizes and quality
- Implement code splitting
- Lazy load screens
- Optimize bundle size
- Reduce re-renders with memoization
- Use native modules where possible
- Profile with React DevTools Profiler

### Q68: How would you implement push notifications?
**Expected Answer:**
- Use Expo Notifications
- Request permissions
- Register device token with backend
- Handle notification taps
- Deep link from notifications
- Show local notifications
- Handle foreground/background states

### Q69: How would you implement analytics?
**Expected Answer:**
- Integrate analytics SDK (Firebase, Mixpanel, etc.)
- Track screen views
- Track user actions (add to cart, purchase)
- Track conversion funnel
- Track errors and crashes
- Privacy-compliant tracking

### Q70: How would you handle app updates and versioning?
**Expected Answer:**
- Use Expo Updates for OTA updates
- Version checking on app start
- Force updates for critical versions
- Gradual rollout
- A/B testing capabilities
- Version migration scripts for data

---

## Scenario-Based Questions

### Q71: A user reports that items disappear from cart after closing the app. How would you debug this?
**Expected Answer:**
- Check AsyncStorage save/load logic
- Verify `useEffect` dependencies
- Check for errors in console
- Verify AsyncStorage keys are correct
- Test on different devices
- Check if cart is cleared on logout
- Verify persistence timing

### Q72: The app is slow when loading product lists. How would you optimize it?
**Expected Answer:**
- Profile with React DevTools
- Check for unnecessary re-renders
- Implement pagination
- Optimize FlatList props
- Lazy load images
- Memoize expensive calculations
- Check API response times
- Implement caching

### Q73: Users complain that deep links don't work. How would you fix it?
**Expected Answer:**
- Test all URL schemes
- Check app.json intent filters
- Verify DeepLinkHandler is mounted
- Check URL parsing logic
- Test on both platforms
- Verify store ID format
- Check navigation state
- Add better error logging

### Q74: The voice search is not working on Android. How would you troubleshoot?
**Expected Answer:**
- Check microphone permissions
- Verify API key is set
- Check audio recording setup
- Test on different Android versions
- Check Google Speech-to-Text API status
- Verify audio format conversion
- Check network connectivity
- Review error logs

### Q75: How would you implement a wishlist feature?
**Expected Answer:**
- Add WishlistContext or extend existing context
- Add wishlist API endpoints
- Store wishlist in AsyncStorage
- Add wishlist button to ProductCard
- Create WishlistScreen
- Sync with backend
- Handle offline scenarios

---

## Behavioral & System Design

### Q76: How would you scale this app to support multiple languages (i18n)?
**Expected Answer:**
- Use `react-i18next` or `expo-localization`
- Create translation files per language
- Store user language preference
- Translate all user-facing strings
- Handle RTL languages
- Format dates/numbers per locale
- Test on different languages

### Q77: How would you implement a recommendation engine?
**Expected Answer:**
- Track user behavior (views, purchases)
- Implement collaborative filtering
- Use ML models for recommendations
- Cache recommendations
- Show "You may also like" sections
- Personalize home screen
- A/B test different algorithms

### Q78: How would you handle payment failures and retries?
**Expected Answer:**
- Store failed payment attempts
- Implement retry mechanism with backoff
- Show clear error messages
- Allow manual retry
- Support multiple payment methods
- Handle partial payments
- Notify user of payment status
- Store payment history

### Q79: How would you implement a loyalty/rewards program?
**Expected Answer:**
- Track user points/credits
- Award points on purchases
- Show points balance in profile
- Redeem points for discounts
- Show points history
- Implement referral program
- Sync with backend
- Handle edge cases (expired points)

### Q80: How would you ensure data consistency between local and server state?
**Expected Answer:**
- Implement sync mechanism
- Use timestamps for conflict resolution
- Server as source of truth
- Merge strategies for conflicts
- Show sync status to user
- Handle offline changes
- Implement optimistic updates
- Queue sync operations

---

## End of Questions

**Tips for Interview Preparation:**
1. Review the actual code files mentioned in questions
2. Understand the flow of data through the app
3. Be ready to explain trade-offs and design decisions
4. Practice explaining complex concepts simply
5. Be prepared to write code or pseudo-code
6. Think about edge cases and error scenarios
7. Consider scalability and performance implications

**Good Luck! 🚀**

