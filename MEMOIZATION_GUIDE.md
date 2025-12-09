# Memoization in E-Comm Expo Project

## Overview

This project uses **React memoization** in several places to optimize performance and prevent unnecessary re-renders. The codebase uses three main memoization techniques:

1. **`useMemo`** - Memoize computed values
2. **`useCallback`** - Memoize functions
3. **`React.memo`** - Memoize components

---

## Memoization Techniques Used

### 1. `useMemo` - Memoizing Computed Values

Used to prevent expensive calculations from running on every render.

#### **ThemeContext** (`contexts/ThemeContext.tsx`)

**Purpose**: Memoize theme object to prevent unnecessary recalculations

```typescript
const theme = useMemo(() => {
  const baseTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const section: AppSection = appSection === 'pharma' ? 'pharma' : 'grocery';
  const sectionColors = baseTheme.colors[section];

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: sectionColors.primary,
      secondary: sectionColors.secondary,
      tertiary: sectionColors.tertiary,
    },
  };
}, [themeMode, appSection]);  // Only recalculate when themeMode or appSection changes
```

**Why it's needed**:
- Theme object is used throughout the app
- Recalculating on every render would be expensive
- Only needs to update when `themeMode` or `appSection` changes

**Performance Impact**: Prevents theme recalculation on every render, saving CPU cycles.

---

#### **HomeScreen Styles** (`screens/home/HomeScreen.tsx`)

**Purpose**: Memoize StyleSheet creation to prevent recreation on every render

```typescript
const themedStyles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    // ... more styles
  },
  // ... many more style definitions
}), [theme]);  // Only recreate when theme changes
```

**Why it's needed**:
- `StyleSheet.create()` is expensive
- Styles only need to change when theme changes
- Prevents creating new style objects on every render

**Performance Impact**: Significant - prevents style object recreation, reducing memory allocations.

---

#### **GroceryHomeScreen Styles** (`screens/home/GroceryHomeScreen.tsx`)

**Purpose**: Same as HomeScreen - memoize StyleSheet creation

```typescript
const themedStyles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ... extensive style definitions
}), [theme]);
```

**Performance Impact**: Prevents unnecessary style recalculations.

---

#### **CategoryDetailScreen - Brands Extraction** (`screens/category/CategoryDetailScreen.tsx`)

**Purpose**: Memoize expensive array processing operation

```typescript
// Collect all brands from products in the selected subcategory
const allBrands = useMemo(() => {
  const brandsSet = new Set<string>();
  if (Array.isArray(subCategories)) {
    subCategories.forEach((sc: SubCategory) => {
      if (sc.products && Array.isArray(sc.products)) {
        sc.products.forEach((p: Product) => p.brand && brandsSet.add(p.brand));
      }
    });
  }
  return Array.from(brandsSet);
}, [subCategories]);  // Only recalculate when subCategories change
```

**Why it's needed**:
- Iterates through potentially large arrays of products
- Creates a Set and converts to Array
- Only needs to run when `subCategories` changes

**Performance Impact**: Prevents expensive array processing on every render.

---

#### **Under99ProductsScreen - Store ID** (`screens/product/Under99ProductsScreen.tsx`)

**Purpose**: Memoize derived value to prevent unnecessary recalculations

```typescript
const activeStoreId = useMemo(() => {
  return selectedStore?.id || lastVisitedStore?.id || 'c4defa9f-0bf2-4226-a4b9-6b578e737714';
}, [selectedStore, lastVisitedStore]);
```

**Why it's needed**:
- Simple value derivation but used in useEffect dependency
- Prevents unnecessary effect re-runs
- Ensures stable reference for dependencies

**Performance Impact**: Prevents unnecessary useEffect re-executions.

---

#### **App.tsx - Navigation Linking Config** (`App.tsx`)

**Purpose**: Memoize navigation linking configuration

```typescript
const linking = React.useMemo<LinkingOptions<RootStackParamList>>(() => ({
  prefixes: [
    'paaskidukaan://',
    'ecomm://',
    'https://stores.yourdomain.com',
    // ... more prefixes
  ],
  config: {
    screens: {
      Splash: 'splash',
      Pincode: 'pincode',
      // ... screen configs
    },
  },
  getStateFromPath: (path, options) => {
    // ... handler
    return undefined;
  },
}), []);  // Empty dependency array - never changes
```

**Why it's needed**:
- Navigation linking config is static
- Prevents NavigationContainer from re-initializing
- Empty dependency array means it's created once

**Performance Impact**: Prevents NavigationContainer re-initialization.

---

### 2. `useCallback` - Memoizing Functions

Used to prevent function recreation on every render, especially important for:
- Event handlers passed to child components
- Functions used in useEffect dependencies
- Functions passed to optimized child components

#### **HomeScreen** (`screens/home/HomeScreen.tsx`)

```typescript
const toggleDrawer = React.useCallback(() => {
  setIsDrawerVisible(!isDrawerVisible);
}, [isDrawerVisible]);

const handleOverlayPress = React.useCallback(() => {
  setIsDrawerVisible(false);
}, []);

useFocusEffect(
  React.useCallback(() => {
    setSection('grocery');
  }, [])
);
```

**Why it's needed**:
- Functions passed to child components
- Stable references prevent unnecessary re-renders
- Used in useEffect/useFocusEffect dependencies

---

#### **MyAddressesScreen** (`screens/profile/MyAddressesScreen.tsx`)

**Extensive use of useCallback**:

```typescript
const onRefresh = useCallback(async () => {
  // Refresh logic
}, []);

const getTypeIcon = useCallback((label: string) => {
  // Return icon based on label
}, []);

const getTypeColor = useCallback((label: string) => {
  // Return color based on label
}, []);

const handleAddAddress = useCallback(() => {
  navigation.navigate('AddAddress');
}, [navigation]);

const handleDeleteAddress = useCallback(async (addressId: string) => {
  // Delete logic
}, []);

const handleSetDefaultAddress = useCallback(async (addressId: string) => {
  // Set default logic
}, []);

const handleSelectAddress = useCallback((address: Address) => {
  // Selection logic
}, []);

const renderAddressItem = useCallback(({ item }: { item: Address }) => {
  // Render logic
}, []);
```

**Why it's needed**:
- Many callbacks used in FlatList renderItem
- Prevents FlatList from re-rendering all items
- Stable function references improve performance

**Performance Impact**: Significant - FlatList performance optimization.

---

#### **Voice Search Hooks** (`hooks/useVoiceSearch.ts`, `hooks/useVoiceRecognition.ts`)

```typescript
const requestMicPermission = useCallback(async (): Promise<boolean> => {
  // Permission logic
}, []);

const startListening = useCallback(async () => {
  // Start listening logic
}, []);

const stopListening = useCallback(async () => {
  // Stop listening logic
}, []);

const cleanup = useCallback(async () => {
  // Cleanup logic
}, []);
```

**Why it's needed**:
- Functions exposed from custom hooks
- Stable references prevent unnecessary hook re-executions
- Used in useEffect dependencies

---

#### **Payment Hook** (`hooks/usePayment.ts`)

```typescript
const placeOrder = useCallback(async (orderData: PlaceOrderRequest) => {
  // Place order logic
}, []);

const initiatePayment = useCallback(async (orderData: any, originalOrderData: PlaceOrderRequest) => {
  // Payment initiation logic
}, []);

const reorderProducts = useCallback(async (orderItems: any[], cartType: 'grocery' | 'pharma') => {
  // Reorder logic
}, []);
```

**Why it's needed**:
- Functions returned from custom hook
- Stable references for components using the hook
- Prevents unnecessary re-renders in consuming components

---

#### **Search Screen** (`screens/search/SearchScreen.tsx`)

```typescript
const debouncedSearch = useCallback(
  debounce((query: string) => {
    // Search logic
  }, 300),
  []
);
```

**Why it's needed**:
- Debounced function needs stable reference
- Prevents debounce from being recreated
- Ensures proper debouncing behavior

---

### 3. `React.memo` - Memoizing Components

Used to prevent component re-renders when props haven't changed.

#### **Header Component** (`screens/home/HomeScreen.tsx`)

```typescript
const Header = React.memo(({ onProfilePress, themedStyles, isDrawerVisible }: { 
  onProfilePress: () => void, 
  themedStyles: any, 
  isDrawerVisible: boolean 
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { selectedStore, lastVisitedStore, setSelectedStore } = useAppContext();
  const { groceryItems, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  // Component implementation
});
```

**Why it's needed**:
- Header component is rendered in HomeScreen
- Prevents re-render when parent re-renders but props haven't changed
- Uses shallow comparison of props

**Note**: This component still uses hooks (useTheme, useAppContext, etc.), so it will re-render when those contexts change. `React.memo` only prevents re-renders when props change.

---

#### **MyAddressesScreen** (`screens/profile/MyAddressesScreen.tsx`)

```typescript
const MyAddressesScreen = React.memo(() => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  // ... component implementation
});
```

**Why it's needed**:
- Screen component that doesn't receive props
- Prevents re-render when parent navigator re-renders
- Optimizes screen rendering performance

---

## Memoization Patterns Summary

### Where Memoization is Used

| Location | Technique | Purpose | Impact |
|----------|-----------|---------|--------|
| `ThemeContext.tsx` | `useMemo` | Theme object calculation | High - Used everywhere |
| `HomeScreen.tsx` | `useMemo` | StyleSheet creation | High - Large style object |
| `GroceryHomeScreen.tsx` | `useMemo` | StyleSheet creation | High - Large style object |
| `CategoryDetailScreen.tsx` | `useMemo` | Brands extraction | Medium - Array processing |
| `Under99ProductsScreen.tsx` | `useMemo` | Store ID derivation | Low - Simple value |
| `App.tsx` | `useMemo` | Navigation linking config | Medium - Navigation setup |
| `HomeScreen.tsx` | `useCallback` | Event handlers | Medium - Prevents re-renders |
| `MyAddressesScreen.tsx` | `useCallback` | Multiple callbacks | High - FlatList optimization |
| `useVoiceSearch.ts` | `useCallback` | Hook functions | Medium - Hook stability |
| `usePayment.ts` | `useCallback` | Payment functions | Medium - Hook stability |
| `HomeScreen.tsx` | `React.memo` | Header component | Medium - Component optimization |
| `MyAddressesScreen.tsx` | `React.memo` | Screen component | Low - Screen optimization |

---

## Performance Benefits

### 1. **Prevented Re-renders**
- `React.memo` prevents unnecessary component re-renders
- `useCallback` prevents child components from re-rendering due to new function references

### 2. **Reduced Calculations**
- `useMemo` prevents expensive calculations on every render
- Theme object, styles, and array processing are memoized

### 3. **Stable References**
- `useCallback` provides stable function references
- Important for useEffect dependencies
- Prevents infinite loops in effects

### 4. **Memory Optimization**
- Prevents creating new objects/functions on every render
- Reduces garbage collection pressure

---

## Best Practices Used

### ✅ 1. **Memoize Expensive Calculations**
```typescript
// ✅ Good - Expensive calculation
const allBrands = useMemo(() => {
  // Complex array processing
}, [dependencies]);

// ❌ Bad - Simple calculation (overhead > benefit)
const simpleValue = useMemo(() => value * 2, [value]);
```

### ✅ 2. **Memoize Functions Passed to Children**
```typescript
// ✅ Good - Function passed to child
const handlePress = useCallback(() => {
  // handler logic
}, [dependencies]);

// ❌ Bad - Function recreated every render
const handlePress = () => {
  // handler logic
};
```

### ✅ 3. **Memoize StyleSheet Creation**
```typescript
// ✅ Good - StyleSheet creation
const styles = useMemo(() => StyleSheet.create({
  // styles
}), [theme]);

// ❌ Bad - Recreated every render
const styles = StyleSheet.create({
  // styles
});
```

### ✅ 4. **Correct Dependency Arrays**
```typescript
// ✅ Good - All dependencies included
const memoized = useMemo(() => {
  return compute(a, b);
}, [a, b]);

// ❌ Bad - Missing dependencies
const memoized = useMemo(() => {
  return compute(a, b);
}, [a]);  // Missing 'b'
```

---

## When NOT to Use Memoization

### ❌ **Over-memoization Anti-patterns**

1. **Simple Calculations**
   ```typescript
   // ❌ Don't memoize simple operations
   const doubled = useMemo(() => value * 2, [value]);
   
   // ✅ Just compute directly
   const doubled = value * 2;
   ```

2. **Primitive Values**
   ```typescript
   // ❌ Don't memoize primitives
   const id = useMemo(() => user.id, [user]);
   
   // ✅ Just use directly
   const id = user.id;
   ```

3. **Every Function**
   ```typescript
   // ❌ Don't memoize every function
   const simpleHandler = useCallback(() => {
     console.log('clicked');
   }, []);
   
   // ✅ Only memoize if passed to optimized children
   const simpleHandler = () => {
     console.log('clicked');
   };
   ```

---

## Interview Talking Points

### 1. **Why Use Memoization?**
> "We use memoization strategically to optimize performance. We memoize expensive calculations like theme object creation and StyleSheet generation, functions passed to child components to prevent unnecessary re-renders, and components that receive stable props."

### 2. **ThemeContext Optimization**
> "In ThemeContext, we use `useMemo` to memoize the theme object calculation. This prevents recalculating the theme on every render, which is important since the theme is used throughout the app. It only recalculates when `themeMode` or `appSection` changes."

### 3. **StyleSheet Memoization**
> "We memoize StyleSheet creation in HomeScreen and GroceryHomeScreen because `StyleSheet.create()` is expensive and styles only need to change when the theme changes. This prevents creating new style objects on every render, reducing memory allocations."

### 4. **FlatList Optimization**
> "In MyAddressesScreen, we use `useCallback` extensively for functions passed to FlatList's `renderItem` prop. This prevents FlatList from re-rendering all items when the parent re-renders, significantly improving scroll performance."

### 5. **Component Memoization**
> "We use `React.memo` for the Header component in HomeScreen to prevent it from re-rendering when the parent re-renders but props haven't changed. This is especially important for components that are rendered frequently."

### 6. **Custom Hooks**
> "In our custom hooks like `useVoiceSearch` and `usePayment`, we use `useCallback` to return stable function references. This prevents components using these hooks from re-rendering unnecessarily when the hook re-executes."

### 7. **Navigation Configuration**
> "We memoize the navigation linking configuration in App.tsx with an empty dependency array since it's static. This prevents NavigationContainer from re-initializing on every render."

### 8. **Strategic Approach**
> "We don't over-memoize. We only use memoization where it provides real performance benefits - expensive calculations, functions passed to optimized children, and components that receive stable props. We avoid memoizing simple operations where the overhead would exceed the benefit."

---

## Code Examples

### Theme Memoization
```typescript
// contexts/ThemeContext.tsx
const theme = useMemo(() => {
  const baseTheme = themeMode === 'light' ? lightTheme : darkTheme;
  const sectionColors = baseTheme.colors[appSection];
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: sectionColors.primary,
    },
  };
}, [themeMode, appSection]);
```

### StyleSheet Memoization
```typescript
// screens/home/HomeScreen.tsx
const themedStyles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ... many styles
}), [theme]);
```

### Function Memoization
```typescript
// screens/profile/MyAddressesScreen.tsx
const handleAddAddress = useCallback(() => {
  navigation.navigate('AddAddress');
}, [navigation]);

const renderAddressItem = useCallback(({ item }: { item: Address }) => {
  return <AddressItem address={item} />;
}, []);
```

### Component Memoization
```typescript
// screens/home/HomeScreen.tsx
const Header = React.memo(({ onProfilePress, themedStyles, isDrawerVisible }) => {
  // Component implementation
});
```

---

## Summary

**Memoization Usage**:
- ✅ **7 instances of `useMemo`** - For expensive calculations
- ✅ **20+ instances of `useCallback`** - For function stability
- ✅ **2 instances of `React.memo`** - For component optimization

**Key Areas**:
1. Theme calculation (ThemeContext)
2. StyleSheet creation (HomeScreen, GroceryHomeScreen)
3. Array processing (CategoryDetailScreen)
4. Event handlers (Multiple screens)
5. FlatList optimization (MyAddressesScreen)
6. Custom hooks (useVoiceSearch, usePayment)
7. Navigation configuration (App.tsx)

**Performance Impact**: 
- Prevents unnecessary re-renders
- Reduces expensive calculations
- Optimizes FlatList performance
- Reduces memory allocations

**Result**: Strategic memoization that improves performance without over-optimization! 🚀

