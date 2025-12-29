# Quick Reference Guide - Key Concepts for Interview

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│         React Components            │
│    (Screens, UI Components)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Context API (State)            │
│  Auth, Cart, Theme, App, etc.       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Service Layer                  │
│  authService, productService, etc.   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      API Client (Axios Wrapper)     │
│  Error handling, retry, auth        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      AsyncStorage (Persistence)      │
│  Cart, User, Token, Store           │
└─────────────────────────────────────┘
```

## 📦 Key Contexts

| Context | Purpose | Key State |
|---------|---------|-----------|
| **AuthContext** | Authentication | `user`, `token`, `isAuthenticated` |
| **CartContext** | Shopping cart | `groceryItems`, `pharmacyItems`, `totalItems` |
| **ThemeContext** | UI theming | `themeMode`, `theme`, `appSection` |
| **AppContext** | App-level state | `selectedStore`, `userLocation`, `lastVisitedStore` |
| **StorageContext** | AsyncStorage ops | Storage helper functions |
| **ToastContext** | Notifications | Toast display functions |
| **DeepLinkContext** | Deep link state | Processing flags |

## 🔄 Data Flow Examples

### Adding to Cart
```
User clicks "Add to Cart"
  → ProductCard calls addToGroceryCart()
  → CartContext updates state
  → useEffect saves to AsyncStorage
  → UI re-renders with new total
```

### Authentication Flow
```
User enters phone → sendOTP()
  → API call → OTP sent
User enters OTP → verifyOTP()
  → API returns JWT token
  → Token decoded → User data extracted
  → Saved to AsyncStorage
  → AuthContext updates
  → User logged in
```

### Deep Link Flow
```
URL received → DeepLinkHandler
  → DeepLinkingService.parseDeepLink()
  → Extract storeId
  → Fetch store details from API
  → Set store in AppContext
  → Navigate to HomeScreen
```

## 🛠️ API Client Features

```typescript
// Key Features:
✅ Automatic token injection (marg-customer-token header)
✅ Retry mechanism (3 attempts, exponential backoff)
✅ Error standardization (ApiError format)
✅ Timeout handling (30s default)
✅ Request/response logging
✅ Token refresh support
```

## 🎯 Performance Optimizations

1. **Memoization**
   - `React.memo` for components
   - `useMemo` for computed values (theme, totals)
   - `useCallback` for functions

2. **List Optimization**
   - `FlatList` for virtualization
   - `keyExtractor` for efficient rendering
   - Lazy loading images

3. **State Management**
   - Split contexts by domain
   - Avoid unnecessary re-renders
   - Local state when possible

## 🔗 Deep Link URL Patterns

```
Custom Schemes:
  paaskidukaan://store/{storeId}
  ecomm://store/{storeId}

HTTPS:
  https://stores.yourdomain.com/store/{storeId}
  https://qr.ecomm.com/s/{storeId}
  https://marg-api.thelocalsandbox.dev/dl/{storeId}
```

## 🎤 Voice Search Flow

```
User taps mic
  → Request permissions
  → Start Audio.Recording
  → User speaks
  → Stop recording
  → Convert to base64
  → Send to Google Speech-to-Text API
  → Get transcript
  → Use as search query
```

## 🔐 Security Considerations

⚠️ **Current Issues:**
- Tokens stored in plain text (AsyncStorage)
- No token expiration checking
- No refresh token mechanism

✅ **Should Implement:**
- Encrypted storage (react-native-keychain)
- Token expiration validation
- Refresh token flow
- Secure API key storage

## 📱 Navigation Structure

```
RootStackNavigator
  ├── Splash
  ├── Pincode
  ├── StoreList
  ├── Main (BottomTabNavigator)
  │   ├── Home
  │   ├── Categories
  │   ├── Search
  │   └── Profile
  ├── Cart
  ├── ProductDetail
  ├── Checkout
  └── ... (other screens)
```

## 🧪 Testing Strategy

**Unit Tests:**
- Context functions (addToCart, updateQuantity)
- Utility functions (priceFormatter)
- Service functions (API calls mocked)

**Integration Tests:**
- Navigation flows
- Deep linking
- Authentication flow
- Cart persistence

**E2E Tests:**
- Complete user journeys
- Payment flow
- Order placement

## 🚀 Common Interview Scenarios

### "How would you add feature X?"
1. Identify where it fits (context, service, component)
2. Design data structure
3. Implement API integration
4. Add UI components
5. Handle edge cases
6. Add tests

### "What would you improve?"
1. Add comprehensive testing
2. Implement error logging (Sentry)
3. Add offline support
4. Improve performance (memoization, lazy loading)
5. Enhance security (encrypted storage)
6. Add analytics
7. Implement CI/CD

### "How does X work?"
1. Start with high-level overview
2. Break down into steps
3. Mention key components/files
4. Explain data flow
5. Mention edge cases
6. Suggest improvements

## 📝 Key Code Patterns

### Context Pattern
```typescript
const Context = createContext<ContextType>(defaultValue);
export const Provider = ({ children }) => {
  const [state, setState] = useState();
  return <Context.Provider value={{ state }}>{children}</Context.Provider>;
};
export const useContext = () => useContext(Context);
```

### Service Pattern
```typescript
export const productService = {
  getProducts: (storeId: string) => 
    apiClient.get<Product[]>(`/products/${storeId}`),
  // ... other methods
};
```

### Custom Hook Pattern
```typescript
export const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  // ... logic
  return { isListening, startListening, stopListening };
};
```

## 🎓 Key Takeaways

1. **Architecture**: Service layer → API client → Axios
2. **State**: Context API (7 contexts) + AsyncStorage
3. **Navigation**: React Navigation with deep linking
4. **Performance**: Memoization, FlatList, lazy loading
5. **Security**: Needs improvement (encrypted storage)
6. **Error Handling**: Centralized in API client
7. **Type Safety**: Full TypeScript implementation

## 💡 Pro Tips for Interview

1. **Be Specific**: Reference actual files and functions
2. **Show Trade-offs**: Explain why Context API over Redux
3. **Think Edge Cases**: What if network fails? What if token expires?
4. **Suggest Improvements**: Show you think critically
5. **Code Examples**: Be ready to write pseudo-code
6. **Explain Simply**: Break down complex concepts

---

**Remember**: Understanding the "why" is as important as the "what"!

