# 🎯 Must-Know Code Snippets - Quick Reference

**Memorize these patterns - they're asked in 90% of interviews!**

---

## 1. ⭐ Add to Cart Function (MOST COMMON)

```typescript
const addToCart = (product: Product) => {
  setCartItems(prevItems => {
    const existing = prevItems.find(item => item.id === product.id);
    if (existing) {
      return prevItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prevItems, { ...product, quantity: 1 }];
  });
};
```

**Key Points:**
- ✅ Functional update `prevItems =>`
- ✅ Check for existing item
- ✅ Immutable update (spread operator)
- ✅ Return new array

---

## 2. ⭐ Calculate Total

```typescript
const total = items.reduce(
  (sum, item) => sum + (item.price * item.quantity),
  0
);
```

**With rounding:**
```typescript
const total = Math.round(
  items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100
) / 100;
```

---

## 3. ⭐ useDebounce Hook

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

---

## 4. ⭐ Error Handling

```typescript
const handleApiError = (error: any) => {
  if (error.response) {
    // Server error
    return {
      code: `HTTP_${error.response.status}`,
      message: error.response.data?.message || 'Request failed',
    };
  } else if (error.request) {
    // Network error
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Check connection.',
    };
  } else {
    // Other error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
    };
  }
};
```

---

## 5. ⭐ Price Formatter

```typescript
const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2).replace(/\.?0+$/, '');
};
```

---

## 6. ⭐ Update Quantity

```typescript
const updateQuantity = (productId: string, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  setCartItems(prev =>
    prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
  );
};
```

---

## 7. ⭐ AsyncStorage Save/Load

```typescript
// Save
const saveData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Save error:', error);
  }
};

// Load
const loadData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};
```

---

## 8. ⭐ Context Provider Pattern

```typescript
const Context = createContext<ContextType | null>(null);

export const Provider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  return (
    <Context.Provider value={{ state, setState }}>
      {children}
    </Context.Provider>
  );
};

export const useContext = () => {
  const context = useContext(Context);
  if (!context) throw new Error('Must be used within Provider');
  return context;
};
```

---

## 9. ⭐ useMemo for Expensive Calculations

```typescript
const filteredProducts = useMemo(() => {
  return products.filter(product => {
    // filtering logic
    return product.price > minPrice;
  });
}, [products, minPrice]); // Only recalculates when these change
```

---

## 10. ⭐ useCallback for Functions

```typescript
const handlePress = useCallback((item: Product) => {
  onItemPress(item);
}, [onItemPress]);
```

---

## 11. ⭐ Retry Mechanism

```typescript
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error('Max attempts reached');
};
```

---

## 12. ⭐ Deep Link Parser

```typescript
const parseDeepLink = (url: string) => {
  // ecomm://store/{id}
  if (url.startsWith('ecomm://store/')) {
    return { type: 'store', id: url.replace('ecomm://store/', '') };
  }
  
  // https://domain.com/store/{id}
  const match = url.match(/\/store\/([^\/]+)/);
  if (match) {
    return { type: 'store', id: match[1] };
  }
  
  return { type: 'unknown' };
};
```

---

## 13. ⭐ Discount Calculator

```typescript
const calculateDiscount = (original: number, current: number): number => {
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};
```

---

## 14. ⭐ React.memo Pattern

```typescript
const ProductCard = React.memo(({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{product.name}</Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
```

---

## 15. ⭐ Form Validation

```typescript
const validateForm = (fields: Record<string, string>): boolean => {
  let isValid = true;
  
  Object.keys(fields).forEach(key => {
    if (!fields[key].trim()) {
      setError(key, 'Required');
      isValid = false;
    }
  });
  
  return isValid;
};
```

---

## 16. ⭐ Debounced Search Implementation

```typescript
// Debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Usage
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (!query.trim()) return;
    const response = await searchAPI(query);
    setResults(response.data);
  }, 500),
  []
);
```

---

## 17. ⭐ Search with History (AsyncStorage)

```typescript
// Load history
useEffect(() => {
  const loadHistory = async () => {
    const saved = await AsyncStorage.getItem('searchHistory');
    if (saved) setRecentSearches(JSON.parse(saved));
  };
  loadHistory();
}, []);

// Save to history
const saveToHistory = async (query: string) => {
  if (!recentSearches.includes(query)) {
    const newSearches = [query, ...recentSearches.slice(0, 4)];
    setRecentSearches(newSearches);
    await AsyncStorage.setItem('searchHistory', JSON.stringify(newSearches));
  }
};
```

---

## 🎯 **Top 5 to Memorize First**

1. **Add to Cart** - Most common pattern
2. **useDebounce** - Shows hook knowledge
3. **Error Handling** - Essential skill
4. **Calculate Total** - Simple but frequent
5. **Context Provider** - Core React pattern

**Bonus:** **Debounced Search** - Very common in interviews!

---

## 💡 **Quick Tips**

- Always use **functional updates** for state: `setState(prev => ...)`
- Always return **new objects/arrays** (immutability)
- Always handle **errors** in async functions
- Always use **TypeScript types**
- Always **clean up** in useEffect (return cleanup function)

---

**Practice writing these from memory!** 🚀

