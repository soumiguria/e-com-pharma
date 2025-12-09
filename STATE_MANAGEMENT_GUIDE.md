# State Management in E-Comm Expo Project

## Overview

This project uses **React Context API** for state management, combined with **AsyncStorage** for persistence. It does NOT use Redux, Zustand, or other external state management libraries.

---

## State Management Solution: React Context API

### What is Being Used?

**Primary Solution**: React Context API + React Hooks (`useState`, `useEffect`)

**Persistence Layer**: `@react-native-async-storage/async-storage`

**No External Libraries**: No Redux, Zustand, Recoil, MobX, or Jotai

---

## Why React Context API Was Chosen

### 1. **Built-in Solution (No Dependencies)**
- ✅ Context API comes with React - no additional packages needed
- ✅ Reduces bundle size
- ✅ No learning curve for new team members
- ✅ No version conflicts or compatibility issues

### 2. **Perfect for App-Scale State**
- ✅ The app has **7 distinct context domains** (not a massive global state)
- ✅ Each context is focused and scoped to specific features
- ✅ No need for complex state management patterns

### 3. **React Native Best Practices**
- ✅ Context API is the recommended approach for React Native apps
- ✅ Works seamlessly with React Navigation
- ✅ Integrates well with AsyncStorage for persistence

### 4. **Simplicity & Maintainability**
- ✅ Easy to understand and debug
- ✅ Clear separation of concerns (each context handles one domain)
- ✅ TypeScript support is straightforward
- ✅ Less boilerplate than Redux

### 5. **Performance is Sufficient**
- ✅ Context API performance is fine for this app's scale
- ✅ State updates are localized to specific contexts
- ✅ No unnecessary re-renders (contexts are split by domain)

### 6. **AsyncStorage Integration**
- ✅ Context API pairs naturally with AsyncStorage
- ✅ Easy to persist state on device
- ✅ Simple to load/save state on app start/close

---

## Context Architecture

The app uses **7 Context Providers** organized by domain:

```
App.tsx
└── NavigationContainer
    └── NativeBaseProvider
        └── AppProvider          ← App-level state (store, location, user)
            └── StorageProvider  ← AsyncStorage wrapper
                └── CartProvider ← Shopping cart state
                    └── ToastProvider ← Toast notifications
                        └── DeepLinkProvider ← Deep link processing state
                            └── ThemeProvider ← Theme & UI state
                                └── AuthProvider ← Authentication state
```

### 1. **AppContext** (`contexts/AppContext.tsx`)
**Purpose**: Core app-level state

**State Managed**:
- `selectedStore`: Currently selected store
- `lastVisitedStore`: Last visited store (persisted)
- `userLocation`: User's GPS location
- `cart`: Legacy cart (being phased out)
- `user`: Legacy user (being phased out)

**Key Features**:
- Auto-loads last visited store on app start
- Persists store selection to AsyncStorage
- Provides store selection methods

**Usage**:
```typescript
const { selectedStore, setSelectedStore, saveLastVisitedStore } = useAppContext();
```

---

### 2. **CartContext** (`contexts/CartContext.tsx`)
**Purpose**: Shopping cart management

**State Managed**:
- `groceryItems`: Grocery cart items
- `pharmacyItems`: Pharmacy cart items
- `groceryTotal`: Calculated grocery total
- `pharmacyTotal`: Calculated pharmacy total
- `totalItems`: Total items count

**Key Features**:
- Separate carts for grocery and pharmacy
- Auto-persists to AsyncStorage
- Quantity management
- Cart clearing with reset option
- Computed totals (derived state)

**Methods**:
- `addToGroceryCart(product)`
- `addToPharmacyCart(product)`
- `removeFromCart(productId, category)`
- `updateQuantity(productId, quantity, category)`
- `clearCart(resetAll?)`
- `resetAllContexts()`

**Usage**:
```typescript
const { 
  groceryItems, 
  pharmacyItems, 
  addToGroceryCart, 
  totalItems 
} = useCart();
```

**Persistence**:
```typescript
// Auto-saves to AsyncStorage
useEffect(() => {
  AsyncStorage.setItem('groceryCart', JSON.stringify(groceryItems));
  AsyncStorage.setItem('pharmacyCart', JSON.stringify(pharmacyItems));
}, [groceryItems, pharmacyItems]);
```

---

### 3. **AuthContext** (`contexts/AuthContext.tsx`)
**Purpose**: Authentication and user management

**State Managed**:
- `user`: Current user object (from JWT token)
- `token`: JWT authentication token
- `isAuthenticated`: Boolean auth status
- `isLoading`: Loading state

**Key Features**:
- JWT token management
- Auto-loads user from AsyncStorage on app start
- OTP-based login/registration
- Token decoding and validation
- User data refresh

**Methods**:
- `login(mobile, otp, otpKey)`
- `register(userData)`
- `logout()`
- `sendOTP(mobile)`
- `refreshUser()`

**Usage**:
```typescript
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout 
} = useAuth();
```

**Persistence**:
```typescript
// Saves to AsyncStorage
await AsyncStorage.setItem('user_data', JSON.stringify(user));
await AsyncStorage.setItem('auth_token', token);
```

---

### 4. **ThemeContext** (`contexts/ThemeContext.tsx`)
**Purpose**: Theme and UI state

**State Managed**:
- `theme`: Current theme object (colors, styles)
- `themeMode`: 'light' | 'dark'
- `section`: 'grocery' | 'pharma' (app section)

**Key Features**:
- Light/dark mode support
- Section-specific theming (grocery vs pharmacy)
- Persists theme preference
- Memoized theme calculation

**Usage**:
```typescript
const { theme, themeMode, toggleTheme, setSection } = useTheme();
```

---

### 5. **DeepLinkContext** (`contexts/DeepLinkContext.tsx`)
**Purpose**: Deep link processing coordination

**State Managed**:
- `isDeepLinkProcessing`: Is deep link being processed?
- `hasProcessedInitialDeepLink`: Has initial deep link been handled?

**Key Features**:
- Coordinates between DeepLinkHandler and SplashScreen
- Prevents navigation conflicts during app initialization
- Simple boolean flags for coordination

**Usage**:
```typescript
const { 
  isDeepLinkProcessing, 
  hasProcessedInitialDeepLink 
} = useDeepLinkContext();
```

---

### 6. **StorageContext** (`contexts/StorageContext.tsx`)
**Purpose**: AsyncStorage wrapper and legacy state

**State Managed**:
- `selectedStore`: Legacy store state
- `cart`: Legacy cart state
- `user`: Legacy user state
- `appSection`: Current app section

**Key Features**:
- Auto-loads from AsyncStorage on mount
- Auto-saves to AsyncStorage on state change
- Used by ThemeContext for section management

**Note**: This appears to be a legacy context that's being phased out in favor of more specific contexts.

---

### 7. **ToastContext** (`contexts/ToastContext.tsx`)
**Purpose**: Toast notification management

**State Managed**:
- Toast messages and visibility

**Usage**: Provides toast notification functionality across the app

---

## State Management Patterns Used

### 1. **Provider Pattern**
Each context follows the standard Provider pattern:

```typescript
// 1. Create Context
const MyContext = createContext<MyContextType | null>(null);

// 2. Create Provider Component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StateType>(initialState);
  
  // Load from AsyncStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, []);
  
  // Save to AsyncStorage on change
  useEffect(() => {
    saveToStorage();
  }, [state]);
  
  return (
    <MyContext.Provider value={{ state, setState, ...methods }}>
      {children}
    </MyContext.Provider>
  );
};

// 3. Create Custom Hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### 2. **Persistence Pattern**
Most contexts persist state to AsyncStorage:

```typescript
// Load on mount
useEffect(() => {
  const loadData = async () => {
    const data = await AsyncStorage.getItem('key');
    if (data) setState(JSON.parse(data));
  };
  loadData();
}, []);

// Save on change
useEffect(() => {
  const saveData = async () => {
    await AsyncStorage.setItem('key', JSON.stringify(state));
  };
  saveData();
}, [state]);
```

### 3. **Derived State Pattern**
Some contexts compute derived values:

```typescript
// CartContext computes totals
const groceryTotal = Math.round(
  groceryItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  ) * 100
) / 100;

const totalItems = groceryItems.reduce(
  (count, item) => count + item.quantity,
  0
) + pharmacyItems.reduce(
  (count, item) => count + item.quantity,
  0
);
```

### 4. **Error Handling Pattern**
Contexts include error handling:

```typescript
try {
  await AsyncStorage.setItem('key', JSON.stringify(data));
} catch (error) {
  console.error('Error saving data:', error);
}
```

---

## Why NOT Redux/Zustand/Other Libraries?

### Redux
❌ **Not Chosen Because**:
- Too much boilerplate for this app's needs
- Overkill for 7 context domains
- Steeper learning curve
- Requires additional dependencies
- More complex debugging

### Zustand
❌ **Not Chosen Because**:
- Context API is sufficient
- No need for external dependency
- Team already familiar with Context API
- AsyncStorage integration is simpler with Context

### Recoil/MobX/Jotai
❌ **Not Chosen Because**:
- Context API meets all requirements
- No need for atomic state management
- Simpler solution is better for this project

---

## Advantages of This Approach

### ✅ **Simplicity**
- Easy to understand and maintain
- No complex patterns or abstractions
- Clear code flow

### ✅ **Type Safety**
- Full TypeScript support
- Type-safe context values
- Compile-time error checking

### ✅ **Performance**
- Contexts are split by domain (prevents unnecessary re-renders)
- Only components using a context re-render when it changes
- Memoization where needed (ThemeContext)

### ✅ **Persistence**
- Seamless AsyncStorage integration
- Auto-save/load patterns
- No additional libraries needed

### ✅ **Developer Experience**
- Custom hooks for easy access (`useCart()`, `useAuth()`, etc.)
- Clear error messages if used outside provider
- Easy to debug (React DevTools support)

### ✅ **Scalability**
- Easy to add new contexts for new features
- Each context is independent
- No global state pollution

---

## Potential Limitations & When to Consider Alternatives

### Current Limitations (Acceptable for This App)

1. **Context Re-renders**
   - All consumers re-render when context value changes
   - **Mitigation**: Contexts are split by domain (small scope)

2. **No Middleware**
   - No Redux DevTools or middleware support
   - **Mitigation**: Console logging and React DevTools are sufficient

3. **No Time Travel Debugging**
   - Can't replay state changes
   - **Mitigation**: Not needed for this app's complexity

### When to Consider Redux/Zustand

Consider upgrading if:
- ❌ State becomes too complex (100+ actions)
- ❌ Need time-travel debugging
- ❌ Need middleware for logging/analytics
- ❌ Multiple teams working on same state
- ❌ Need to share state across multiple apps

**For this e-commerce app**: Context API is the perfect choice! ✅

---

## Best Practices Used in This Project

### 1. **Context Splitting**
✅ Each context handles one domain (Cart, Auth, Theme, etc.)
✅ Prevents unnecessary re-renders
✅ Clear separation of concerns

### 2. **Custom Hooks**
✅ `useCart()`, `useAuth()`, `useTheme()`, etc.
✅ Provides clean API
✅ Error handling built-in

### 3. **TypeScript Interfaces**
✅ All contexts have typed interfaces
✅ Type-safe state and methods
✅ Better IDE autocomplete

### 4. **Persistence Strategy**
✅ Critical state persisted (cart, auth, store selection)
✅ Non-critical state in memory only (UI state)
✅ AsyncStorage for persistence

### 5. **Error Boundaries**
✅ Contexts handle errors gracefully
✅ Try-catch blocks around AsyncStorage operations
✅ Fallback values provided

---

## Interview Talking Points

### 1. **Why Context API?**
> "We chose React Context API because it's built into React, requires no additional dependencies, and perfectly handles our app's state management needs. We have 7 distinct context domains, each focused on a specific feature area (cart, auth, theme, etc.), which makes the codebase maintainable and easy to understand."

### 2. **How Do You Handle Persistence?**
> "We use AsyncStorage for persistence, integrated directly into our contexts. Each context that needs persistence has useEffect hooks that automatically load from AsyncStorage on mount and save to AsyncStorage whenever state changes. This ensures data persists across app restarts."

### 3. **Performance Considerations**
> "We optimize performance by splitting contexts by domain, so only components using a specific context re-render when that context changes. For example, cart updates only re-render cart-related components, not the entire app. We also use useMemo in ThemeContext to prevent unnecessary theme recalculations."

### 4. **State Management Architecture**
> "Our state management follows a layered architecture: App-level state in AppContext, feature-specific state in dedicated contexts (CartContext, AuthContext), and UI state in ThemeContext. This separation ensures clear boundaries and prevents state pollution."

### 5. **Why Not Redux?**
> "Redux would be overkill for our app. We have 7 focused contexts, not a massive global state tree. Context API provides all the functionality we need with less boilerplate, better TypeScript support, and easier AsyncStorage integration. The team is also more familiar with Context API, which improves development velocity."

### 6. **Error Handling**
> "Each context includes comprehensive error handling. AsyncStorage operations are wrapped in try-catch blocks, and we provide fallback values. Custom hooks throw descriptive errors if used outside their providers, making debugging easier."

### 7. **Scalability**
> "The architecture is highly scalable. Adding a new feature simply means creating a new context. Each context is independent, so there's no risk of breaking existing functionality. The pattern is consistent across all contexts, making it easy for new team members to contribute."

---

## Code Examples

### Using Cart Context
```typescript
import { useCart } from '../contexts/CartContext';

const ProductScreen = () => {
  const { addToGroceryCart, groceryItems, totalItems } = useCart();
  
  const handleAddToCart = (product) => {
    addToGroceryCart(product);
  };
  
  return (
    <View>
      <Text>Items in cart: {totalItems}</Text>
      <Button onPress={() => handleAddToCart(product)} />
    </View>
  );
};
```

### Using Auth Context
```typescript
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return (
    <View>
      <Text>Welcome, {user.firstName}!</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
};
```

### Using Multiple Contexts
```typescript
import { useCart } from '../contexts/CartContext';
import { useAppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutScreen = () => {
  const { groceryItems, groceryTotal } = useCart();
  const { selectedStore } = useAppContext();
  const { user } = useAuth();
  
  // Use all three contexts together
  return <CheckoutForm store={selectedStore} user={user} items={groceryItems} />;
};
```

---

## Summary

**State Management Solution**: React Context API + AsyncStorage

**Why Chosen**:
- ✅ Built-in (no dependencies)
- ✅ Perfect for app-scale state
- ✅ Simple and maintainable
- ✅ Great TypeScript support
- ✅ Easy AsyncStorage integration
- ✅ Sufficient performance

**Architecture**:
- 7 context providers organized by domain
- Custom hooks for easy access
- Auto-persistence with AsyncStorage
- Type-safe with TypeScript

**Result**: A clean, maintainable, and scalable state management solution that perfectly fits the app's needs! 🎯

