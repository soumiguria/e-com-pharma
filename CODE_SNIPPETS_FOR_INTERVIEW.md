# Code Snippets for Technical Interviews

This document contains code snippets from the codebase that interviewers might ask you to write during technical interviews. Study these patterns and be ready to implement similar functionality.

---

## 📋 Table of Contents

1. [Context API Implementation](#1-context-api-implementation)
2. [Custom Hooks](#2-custom-hooks)
3. [API Client Methods](#3-api-client-methods)
4. [Utility Functions](#4-utility-functions)
5. [Component Patterns](#5-component-patterns)
6. [State Management Patterns](#6-state-management-patterns)
7. [AsyncStorage Operations](#7-asyncstorage-operations)
8. [Error Handling](#8-error-handling)
9. [Memoization Patterns](#9-memoization-patterns)
10. [Navigation Patterns](#10-navigation-patterns)
11. [Search Feature Implementation](#11-search-feature-implementation)

---

## 1. Context API Implementation

### 🎯 **Most Likely to Ask: CartContext addToCart function**

**Interview Question:** "Write a function to add an item to cart. If the item already exists, increment its quantity."

```typescript
// Expected Implementation
const addToGroceryCart = (product: Omit<CartItem, 'quantity' | 'category'>) => {
  setGroceryItems(prevItems => {
    const existingItem = prevItems.find(item => item.id === product.id);
    if (existingItem) {
      // Item exists - increment quantity
      return prevItems.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    // New item - add with quantity 1
    return [...prevItems, { ...product, quantity: 1, category: 'grocery' }];
  });
};
```

**Key Points:**
- Uses functional update (`prevItems =>`)
- Checks for existing item by `id`
- Immutable updates (spread operator)
- Returns new array, doesn't mutate

---

### 🎯 **Update Quantity Function**

**Interview Question:** "Write a function to update cart item quantity. Remove item if quantity is 0."

```typescript
const updateQuantity = (productId: string, newQuantity: number, category: 'grocery' | 'pharma') => {
  // Remove from cart if quantity is 0 or negative
  if (newQuantity <= 0) {
    removeFromCart(productId, category);
    return;
  }
  
  if (category === 'grocery') {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  } else {
    setPharmacyItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }
};
```

---

### 🎯 **Calculate Cart Total**

**Interview Question:** "Write a function to calculate the total price of all items in the cart."

```typescript
// Simple version
const total = items.reduce(
  (sum, item) => sum + (item.price * item.quantity),
  0
);

// With rounding (actual implementation)
const groceryTotal = Math.round(
  groceryItems.reduce(
    (total, item) => total + (item.quantity > 0 ? item.price * item.quantity : 0),
    0
  ) * 100
) / 100;
```

---

### 🎯 **Complete Context Provider Pattern**

**Interview Question:** "Create a Context for managing user preferences with persistence."

```typescript
interface PreferencesContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<string>('en');

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedLang = await AsyncStorage.getItem('language');
      if (savedTheme) setThemeState(savedTheme as 'light' | 'dark');
      if (savedLang) setLanguageState(savedLang);
    };
    loadPreferences();
  }, []);

  // Save to AsyncStorage on change
  useEffect(() => {
    AsyncStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    AsyncStorage.setItem('language', language);
  }, [language]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, language, setLanguage }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
```

---

## 2. Custom Hooks

### 🎯 **useCart Hook (Simplified)**

**Interview Question:** "Create a custom hook that provides cart operations."

```typescript
export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  return { items, addItem, removeItem, total };
};
```

---

### 🎯 **useDebounce Hook**

**Interview Question:** "Create a debounce hook for search input."

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

### 🎯 **useAsync Hook**

**Interview Question:** "Create a hook to handle async operations with loading and error states."

```typescript
interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute };
};
```

---

## 3. API Client Methods

### 🎯 **Error Handling Function**

**Interview Question:** "Write a function to standardize API error handling."

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

const handleApiError = (error: any): ApiError => {
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
};
```

---

### 🎯 **Retry Mechanism**

**Interview Question:** "Implement a retry mechanism for failed API requests."

```typescript
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};
```

---

### 🎯 **API Request with Auth Token**

**Interview Question:** "Write a function to make an authenticated API request."

```typescript
const makeAuthenticatedRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    // Get token from storage
    const token = await AsyncStorage.getItem('auth_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['marg-customer-token'] = token;
    }

    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      headers,
      data: data ? JSON.stringify(data) : undefined,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Request failed',
      data: null as any,
    };
  }
};
```

---

## 4. Utility Functions

### 🎯 **Price Formatter**

**Interview Question:** "Write a function to format prices consistently."

```typescript
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '0.00';
  }
  
  // Format to 2 decimal places, removing trailing zeros
  return numPrice.toFixed(2).replace(/\.?0+$/, '');
};

export const formatPriceWithCurrency = (price: number | string, symbol: string = '₹'): string => {
  return `${symbol}${formatPrice(price)}`;
};
```

---

### 🎯 **Deep Link Parser**

**Interview Question:** "Write a function to parse deep link URLs and extract store ID."

```typescript
interface DeepLinkResult {
  type: 'store' | 'unknown';
  storeId?: string;
  originalUrl: string;
}

const parseDeepLink = (url: string): DeepLinkResult => {
  try {
    // Custom scheme: ecomm://store/{storeId}
    if (url.startsWith('ecomm://store/')) {
      const storeId = url.replace('ecomm://store/', '');
      return { type: 'store', storeId, originalUrl: url };
    }

    // HTTPS: https://stores.domain.com/store/{storeId}
    const httpsMatch = url.match(/https:\/\/[^\/]+\/store\/([^\/]+)/);
    if (httpsMatch) {
      return { type: 'store', storeId: httpsMatch[1], originalUrl: url };
    }

    // Short URL: https://qr.domain.com/s/{storeId}
    const shortMatch = url.match(/https:\/\/[^\/]+\/s\/([^\/]+)/);
    if (shortMatch) {
      return { type: 'store', storeId: shortMatch[1], originalUrl: url };
    }

    return { type: 'unknown', originalUrl: url };
  } catch (error) {
    return { type: 'unknown', originalUrl: url };
  }
};
```

---

### 🎯 **Calculate Discount Percentage**

**Interview Question:** "Write a function to calculate discount percentage."

```typescript
const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0 || currentPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Usage in component
const discountPercent = product.originalPrice && product.originalPrice > product.price
  ? calculateDiscount(product.originalPrice, product.price)
  : null;
```

---

## 5. Component Patterns

### 🎯 **ProductCard Component (Simplified)**

**Interview Question:** "Create a ProductCard component that displays product info and has an add to cart button."

```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    originalPrice?: number;
  };
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            {discount && <Text style={styles.discount}>{discount}% off</Text>}
          </>
        )}
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => onAddToCart(product)}
      >
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

### 🎯 **Loading Component**

**Interview Question:** "Create a reusable loading spinner component."

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#1A7B50' 
}) => {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  return (
    <ActivityIndicator 
      size={sizeMap[size]} 
      color={color} 
    />
  );
};
```

---

### 🎯 **Error Display Component**

**Interview Question:** "Create a component to display error messages."

```typescript
interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

---

## 6. State Management Patterns

### 🎯 **AsyncStorage with State Sync**

**Interview Question:** "Implement state that syncs with AsyncStorage."

```typescript
const usePersistedState = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>] => {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved !== null) {
          setState(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading state:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, [key]);

  // Save to storage on change
  const setPersistedState = async (value: T) => {
    try {
      setState(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  return [state, setPersistedState];
};
```

---

### 🎯 **Form State Management**

**Interview Question:** "Create a hook to manage form state with validation."

```typescript
interface FormField {
  value: string;
  error: string | null;
}

interface UseFormReturn {
  fields: Record<string, FormField>;
  setField: (name: string, value: string) => void;
  setError: (name: string, error: string | null) => void;
  validate: () => boolean;
  reset: () => void;
}

export const useForm = (initialFields: string[]): UseFormReturn => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initial: Record<string, FormField> = {};
    initialFields.forEach(field => {
      initial[field] = { value: '', error: null };
    });
    return initial;
  });

  const setField = (name: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: { ...prev[name], value, error: null },
    }));
  };

  const setError = (name: string, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [name]: { ...prev[name], error },
    }));
  };

  const validate = (): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(newFields).forEach(key => {
      if (!newFields[key].value.trim()) {
        newFields[key].error = 'This field is required';
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  };

  const reset = () => {
    const resetFields: Record<string, FormField> = {};
    Object.keys(fields).forEach(key => {
      resetFields[key] = { value: '', error: null };
    });
    setFields(resetFields);
  };

  return { fields, setField, setError, validate, reset };
};
```

---

## 7. AsyncStorage Operations

### 🎯 **Save and Load Functions**

**Interview Question:** "Write functions to save and load data from AsyncStorage with error handling."

```typescript
// Save data
const saveToStorage = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

// Load data
const loadFromStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data !== null) {
      return JSON.parse(data) as T;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
};

// Remove data
const removeFromStorage = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

// Clear all
const clearStorage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};
```

---

## 8. Error Handling

### 🎯 **Error Boundary Component**

**Interview Question:** "Create an Error Boundary component to catch React errors."

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

### 🎯 **Try-Catch Wrapper**

**Interview Question:** "Create a wrapper function to handle async errors consistently."

```typescript
const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Error in async function:', err);
    
    if (onError) {
      onError(err);
    } else {
      // Default error handling
      Alert.alert('Error', err.message);
    }
    
    return null;
  }
};

// Usage
const result = await withErrorHandling(
  async () => {
    return await apiClient.get('/products');
  },
  (error) => {
    showToast(error.message, 'error');
  }
);
```

---

## 9. Memoization Patterns

### 🎯 **Memoized Component**

**Interview Question:** "Optimize a component to prevent unnecessary re-renders."

```typescript
// Before (re-renders on every parent update)
const ProductList = ({ products, onItemPress }) => {
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => onItemPress(item)} />
      )}
    />
  );
};

// After (memoized)
const ProductCard = React.memo(({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{product.name}</Text>
      <Text>₹{product.price}</Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price;
});

const ProductList = ({ products, onItemPress }) => {
  const handleItemPress = useCallback((item: Product) => {
    onItemPress(item);
  }, [onItemPress]);

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => handleItemPress(item)} />
      )}
    />
  );
};
```

---

### 🎯 **Memoized Computed Values**

**Interview Question:** "Optimize expensive calculations using useMemo."

```typescript
const ProductList = ({ products, filters }) => {
  // Expensive calculation - memoize it
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...'); // Only logs when filters change
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    });
  }, [products, filters]); // Only recalculates when these change

  const totalValue = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + p.price, 0);
  }, [filteredProducts]);

  return (
    <View>
      <Text>Total: ₹{totalValue}</Text>
      <FlatList data={filteredProducts} renderItem={...} />
    </View>
  );
};
```

---

## 10. Navigation Patterns

### 🎯 **Navigation with Type Safety**

**Interview Question:** "Set up type-safe navigation."

```typescript
// types.ts
export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: { total: number };
};

// Component
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const HomeScreen = ({ navigation, route }: { 
  navigation: NavigationProp;
  route: ProductDetailRouteProp;
}) => {
  const navigateToProduct = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return <View>...</View>;
};
```

---

### 🎯 **Deep Link Navigation**

**Interview Question:** "Handle deep link navigation to a specific screen."

```typescript
const handleDeepLink = (url: string) => {
  const parsed = parseDeepLink(url);
  
  if (parsed.type === 'store') {
    // Set store in context
    setSelectedStore({ id: parsed.storeId });
    
    // Navigate to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  } else if (parsed.type === 'product') {
    // Navigate to product detail
    navigation.navigate('ProductDetail', { 
      productId: parsed.productId 
    });
  }
};
```

---

## 🎯 **Common Interview Variations**

### Variation 1: "Implement a search with debounce"
```typescript
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 500);

useEffect(() => {
  if (debouncedQuery) {
    searchProducts(debouncedQuery);
  }
}, [debouncedQuery]);
```

### Variation 2: "Implement infinite scroll"
```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore || loading) return;
  
  const nextPage = page + 1;
  const response = await fetchProducts(nextPage);
  
  if (response.data.length === 0) {
    setHasMore(false);
  } else {
    setProducts(prev => [...prev, ...response.data]);
    setPage(nextPage);
  }
};

<FlatList
  data={products}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={hasMore ? <LoadingSpinner /> : null}
/>
```

### Variation 3: "Implement optimistic updates"
```typescript
const addToCartOptimistic = (product: Product) => {
  // Update UI immediately
  setCartItems(prev => [...prev, product]);
  
  // Then sync with server
  addToCartAPI(product).catch(error => {
    // Revert on error
    setCartItems(prev => prev.filter(item => item.id !== product.id));
    showError('Failed to add to cart');
  });
};
```

---

## 11. Search Feature Implementation

### 🎯 **Debounced Search Function**

**Interview Question:** "Implement a search feature with debouncing to avoid too many API calls."

```typescript
// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Usage in component
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState(null);
const [isSearching, setIsSearching] = useState(false);

const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (!query.trim() || !selectedStore?.id) {
      setSearchResults(null);
      return;
    }

    try {
      setIsSearching(true);
      const response = await storeService.searchStoreProducts(selectedStore.id, query);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500), // 500ms delay
  [selectedStore?.id]
);

const handleSearch = (query: string) => {
  setSearchQuery(query);
  debouncedSearch(query);
};
```

---

### 🎯 **Search Screen with History**

**Interview Question:** "Create a search screen with recent searches stored in AsyncStorage."

```typescript
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState(null);

  // Load search history on mount
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const savedSearches = await AsyncStorage.getItem('searchHistory');
        if (savedSearches) {
          setRecentSearches(JSON.parse(savedSearches));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

  // Save search to history
  const saveSearchHistory = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      const trimmedQuery = query.trim().toLowerCase();
      // Add to recent searches if not already present
      if (!recentSearches.includes(trimmedQuery)) {
        const newSearches = [trimmedQuery, ...recentSearches.slice(0, 4)]; // Keep last 5
        setRecentSearches(newSearches);
        saveSearchHistory(newSearches);
      }
    }
    // Trigger search
    performSearch(query);
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await saveSearchHistory([]);
  };

  const removeRecentSearch = async (search: string) => {
    const newSearches = recentSearches.filter(s => s !== search);
    setRecentSearches(newSearches);
    await saveSearchHistory(newSearches);
  };

  return (
    <View>
      <SearchBar 
        onSearch={handleSearch}
        onSubmit={handleSearchSubmit}
        value={searchQuery}
      />
      
      {searchQuery.trim() ? (
        // Show search results
        <SearchResults results={searchResults} />
      ) : (
        // Show recent searches
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSearchSubmit(search)}
            >
              <Text>{search}</Text>
              <TouchableOpacity onPress={() => removeRecentSearch(search)}>
                <Text>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
```

---

### 🎯 **Search Bar Component with Voice Search**

**Interview Question:** "Create a search bar component with text input and voice search integration."

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSubmit,
  placeholder = 'Search products...',
  value,
}) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const { 
    isListening, 
    error: voiceError, 
    result: voiceResult, 
    partialResult, 
    startListening, 
    stopListening, 
    isAvailable 
  } = useVoiceSearch();

  // Update search query when voice result is ready
  useEffect(() => {
    if (voiceResult && voiceResult.trim().length > 0) {
      setSearchQuery(voiceResult);
      onSearch(voiceResult);
    }
  }, [voiceResult, onSearch]);

  // Show partial results in real-time
  useEffect(() => {
    if (partialResult && isListening) {
      setSearchQuery(partialResult);
    }
  }, [partialResult, isListening]);

  const handleVoicePress = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        setSearchQuery(''); // Clear current search when starting voice
        await startListening();
      }
    } catch (error) {
      console.error('Voice search error:', error);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const displayText = isListening && partialResult ? partialResult : searchQuery;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color={colors.text} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={displayText}
          onChangeText={(text) => {
            setSearchQuery(text);
            onSearch(text);
          }}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (onSubmit) {
              onSubmit(searchQuery);
            } else {
              onSearch(searchQuery);
            }
          }}
          editable={!isListening} // Disable editing while listening
        />
        <View style={styles.rightContainer}>
          {isListening && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
          {searchQuery.length > 0 && !isListening && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={22} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleVoicePress}>
            <MaterialCommunityIcons
              name={isListening ? 'microphone' : 'microphone-outline'}
              size={24}
              color={
                isListening
                  ? colors.primary
                  : voiceError
                  ? colors.error
                  : colors.text
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      {isListening && (
        <Text style={styles.listeningText}>
          Listening... {partialResult ? '(speaking)' : '(waiting for speech)'}
        </Text>
      )}
    </View>
  );
};
```

---

### 🎯 **Search API Service Method**

**Interview Question:** "Write a service method to search products in a store."

```typescript
// In storeService.ts
async searchStoreProducts(
  storeId: string, 
  searchTerm: string
): Promise<ApiResponse<{
  categories: any[];
  subcategories: any[];
  products: any[];
}>> {
  return apiClient.get(`/v1/store/${storeId}/search`, { searchTerm });
}
```

---

### 🎯 **Search Results Display**

**Interview Question:** "Display search results grouped by categories, subcategories, and products."

```typescript
const SearchResults = ({ results }: { results: SearchResult | null }) => {
  if (!results) return null;

  const totalResults = (results.categories?.length || 0) + 
                      (results.subcategories?.length || 0) + 
                      (results.products?.length || 0);

  if (totalResults === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <Text>No results found</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text style={styles.resultsCount}>
        {totalResults} results found
      </Text>
      
      {/* Categories */}
      {results.categories && results.categories.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Categories</Text>
          {results.categories.map((category: any) => (
            <TouchableOpacity
              key={category._id}
              onPress={() => handleCategoryPress(category)}
            >
              <Image source={{ uri: category.image }} />
              <Text>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Subcategories */}
      {results.subcategories && results.subcategories.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Subcategories</Text>
          {results.subcategories.map((subcategory: any) => (
            <TouchableOpacity
              key={subcategory._id}
              onPress={() => handleSubcategoryPress(subcategory)}
            >
              <Image source={{ uri: subcategory.image }} />
              <Text>{subcategory.name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Products */}
      {results.products && results.products.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.productsGrid}>
            {results.products.map((product: any) => (
              <ProductCard
                key={product._id}
                product={product}
                onPress={() => handleProductPress(product)}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};
```

---

### 🎯 **useDebounce Hook (Reusable)**

**Interview Question:** "Create a reusable debounce hook for search."

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in SearchScreen
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <TextInput
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Search..."
    />
  );
};
```

---

### 🎯 **Search with Loading and Error States**

**Interview Question:** "Implement search with proper loading and error handling."

```typescript
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim() || !selectedStore?.id) {
      setSearchResults(null);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      const response = await storeService.searchStoreProducts(selectedStore.id, query);
      
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setSearchError(response.error || 'Search failed');
        setSearchResults(null);
      }
    } catch (error) {
      setSearchError('Failed to search products');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View>
      <SearchBar onSearch={setSearchQuery} onSubmit={performSearch} />
      
      {/* Loading State */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Searching...</Text>
        </View>
      )}

      {/* Error State */}
      {searchError && !isSearching && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}

      {/* Results */}
      {searchResults && !isSearching && (
        <SearchResults results={searchResults} />
      )}
    </View>
  );
};
```

---

### 🎯 **Search with useMemo Optimization**

**Interview Question:** "Optimize search results rendering with useMemo."

```typescript
const SearchScreen = () => {
  const [searchResults, setSearchResults] = useState(null);

  // Memoize filtered/processed results
  const processedResults = useMemo(() => {
    if (!searchResults) return null;

    return {
      categories: searchResults.categories || [],
      subcategories: searchResults.subcategories || [],
      products: searchResults.products || [],
      totalCount: 
        (searchResults.categories?.length || 0) + 
        (searchResults.subcategories?.length || 0) + 
        (searchResults.products?.length || 0),
    };
  }, [searchResults]);

  return (
    <View>
      {processedResults && (
        <Text>{processedResults.totalCount} results found</Text>
      )}
    </View>
  );
};
```

---

## 📝 **Tips for Code Interviews**

1. **Start with the interface/types** - Define your data structures first
2. **Handle edge cases** - Empty arrays, null values, errors
3. **Use functional updates** - `setState(prev => ...)` for state updates
4. **Immutable updates** - Always return new objects/arrays
5. **Error handling** - Always include try-catch for async operations
6. **Type safety** - Use TypeScript types/interfaces
7. **Performance** - Mention memoization when appropriate
8. **Clean code** - Use meaningful variable names, add comments for complex logic

---

## 🎯 **Most Frequently Asked Code Snippets**

Based on common interview patterns, these are the **top 5 most likely** to be asked:

1. **Cart add/update functions** (Context API pattern)
2. **Custom hook** (useDebounce, useAsync, useCart)
3. **Error handling function** (API error standardization)
4. **Price formatter utility** (Simple but shows attention to detail)
5. **Component with memoization** (Performance optimization)

**Practice these patterns until you can write them from memory!**

---

Good luck with your interview! 🚀

