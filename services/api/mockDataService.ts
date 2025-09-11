// services/api/mockDataService.ts
// Mock data service for development and testing
import { 
  ApiResponse, 
  Product, 
  Category, 
  Store, 
  Banner,
  Cart,
  CartItem,
  Order,
  UserProfile,
  Address,
  WishlistItem,
  Notification
} from './types';

// Mock delay to simulate API calls
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock success response helper
const mockSuccess = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  // message: 'Success'
});

// Mock error response helper
const mockError = <T>(message: string): ApiResponse<T> => ({
  success: false,
  data: null as any,
  error: message
});

export class MockDataService {
  // Mock products data
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Organic Apples',
      price: 2.99,
      originalPrice: 3.99,
      image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      images: [
        'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.pexels.com/photos/42059/orange-fruit-vitamins-healthy-eating-42059.jpeg',
      ],
      description: 'Fresh organic apples from local farms',
      brand: 'Fresh Farms',
      category: 'grocery',
      subCategory: 'Fruits',
      availableQty: 50,
      unit: 'kg',
      weight: '1kg',
      isAvailable: true,
      isOnSale: true,
      discountPercentage: 25,
      rating: 4.5,
      reviewCount: 128,
      variants: [
        { id: '1-1', name: 'Small Pack (500g)', price: 1.49, stock: 25, unit: '500g' },
        { id: '1-2', name: 'Large Pack (2kg)', price: 5.49, stock: 15, unit: '2kg' },
      ],
      tags: ['organic', 'fresh', 'local'],
      nutritionalInfo: {
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        fiber: 2.4,
        sugar: 10,
      }
    },
    {
      id: '2',
      name: 'Fresh Milk',
      price: 3.49,
      originalPrice: 3.99,
      image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      images: [
        'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ],
      description: 'Fresh whole milk from grass-fed cows',
      brand: 'Dairy Fresh',
      category: 'grocery',
      subCategory: 'Dairy',
      availableQty: 30,
      unit: 'L',
      weight: '1L',
      isAvailable: true,
      isOnSale: true,
      discountPercentage: 12,
      rating: 4.3,
      reviewCount: 89,
      variants: [
        { id: '2-1', name: '500ml', price: 1.99, stock: 20, unit: '500ml' },
        { id: '2-2', name: '2L', price: 6.49, stock: 10, unit: '2L' },
      ],
      tags: ['fresh', 'organic', 'grass-fed'],
      nutritionalInfo: {
        calories: 42,
        protein: 3.4,
        carbs: 5.0,
        fat: 1.0,
        fiber: 0,
        sugar: 5.0,
      }
    },
    {
      id: '3',
      name: 'Whole Grain Bread',
      price: 1.99,
      originalPrice: 2.49,
      image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      images: [
        'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ],
      description: 'Freshly baked whole grain bread',
      brand: 'Bakery Fresh',
      category: 'grocery',
      subCategory: 'Bakery',
      availableQty: 20,
      unit: 'pack',
      weight: '400g',
      isAvailable: true,
      isOnSale: true,
      discountPercentage: 20,
      rating: 4.2,
      reviewCount: 67,
      variants: [
        { id: '3-1', name: 'Small (200g)', price: 1.29, stock: 15, unit: '200g' },
        { id: '3-2', name: 'Large (600g)', price: 2.99, stock: 8, unit: '600g' },
      ],
      tags: ['whole grain', 'fresh', 'baked'],
      nutritionalInfo: {
        calories: 247,
        protein: 9.0,
        carbs: 41,
        fat: 3.2,
        fiber: 7.0,
        sugar: 3.0,
      }
    },
    {
      id: '4',
      name: 'Ibuprofen',
      price: 5.99,
      originalPrice: 7.99,
      image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg',
      images: [
        'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg',
      ],
      description: 'Pain relief tablets 200mg',
      brand: 'MediCare',
      category: 'pharma',
      subCategory: 'Pain Relief',
      availableQty: 100,
      unit: 'pack',
      weight: '20 tablets',
      isAvailable: true,
      isOnSale: true,
      discountPercentage: 25,
      rating: 4.1,
      reviewCount: 234,
      variants: [
        { id: '4-1', name: '10 tablets', price: 3.49, stock: 50, unit: '10 tablets' },
        { id: '4-2', name: '50 tablets', price: 12.99, stock: 25, unit: '50 tablets' },
      ],
      tags: ['pain relief', 'fever', 'headache'],
    },
    {
      id: '5',
      name: 'Vitamin C',
      price: 8.99,
      originalPrice: 11.99,
      image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg',
      images: [
        'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg',
      ],
      description: 'Vitamin C supplements 500mg',
      brand: 'HealthPlus',
      category: 'pharma',
      subCategory: 'Vitamins',
      availableQty: 75,
      unit: 'bottle',
      weight: '60 tablets',
      isAvailable: true,
      isOnSale: true,
      discountPercentage: 25,
      rating: 4.4,
      reviewCount: 156,
      variants: [
        { id: '5-1', name: '30 tablets', price: 5.99, stock: 40, unit: '30 tablets' },
        { id: '5-2', name: '90 tablets', price: 14.99, stock: 20, unit: '90 tablets' },
      ],
      tags: ['vitamin', 'immunity', 'antioxidant'],
    }
  ];

  // Mock categories data
  private mockCategories: Category[] = [
    {
      id: '1',
      name: 'Fruits',
      image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Fresh fruits and berries',
      isActive: true,
      subCategories: [
        {
          id: '1-1',
          name: 'Citrus',
          products: this.mockProducts.filter(p => p.name.toLowerCase().includes('apple')),
        },
        {
          id: '1-2',
          name: 'Berries',
          products: [],
        }
      ]
    },
    {
      id: '2',
      name: 'Dairy',
      image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Fresh dairy products',
      isActive: true,
      subCategories: [
        {
          id: '2-1',
          name: 'Milk',
          products: this.mockProducts.filter(p => p.name.toLowerCase().includes('milk')),
        },
        {
          id: '2-2',
          name: 'Cheese',
          products: [],
        }
      ]
    },
    {
      id: '3',
      name: 'Bakery',
      image: 'https://images.pexels.com/photos/1721934/pexels-photo-1721934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Fresh baked goods',
      isActive: true,
      subCategories: [
        {
          id: '3-1',
          name: 'Bread',
          products: this.mockProducts.filter(p => p.name.toLowerCase().includes('bread')),
        },
        {
          id: '3-2',
          name: 'Pastries',
          products: [],
        }
      ]
    },
    {
      id: '4',
      name: 'Medicines',
      image: 'https://cdn.pixabay.com/photo/2017/02/28/14/37/pills-2106003_1280.jpg',
      description: 'Over-the-counter medicines',
      isActive: true,
      subCategories: [
        {
          id: '4-1',
          name: 'Pain Relief',
          products: this.mockProducts.filter(p => p.name.toLowerCase().includes('ibuprofen')),
        },
        {
          id: '4-2',
          name: 'Vitamins',
          products: this.mockProducts.filter(p => p.name.toLowerCase().includes('vitamin')),
        }
      ]
    }
  ];

  // Mock stores data
  private mockStores: Store[] = [
    {
      id: '1',
      name: 'Fresh Grocery Store',
      type: 'grocery',
      address: '123 Main Street, City Center',
      distance: '0.5 km',
      rating: 4.5,
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      totalItems: 120,
      isOpen: true,
      deliveryTime: '30-45 min',
      minimumOrder: 10,
      deliveryFee: 2.99,
      categories: ['Fruits', 'Dairy', 'Bakery']
    },
    {
      id: '2',
      name: 'Quick Pharmacy',
      type: 'pharma',
      address: '456 Park Avenue, Downtown',
      distance: '1.2 km',
      rating: 4.2,
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      totalItems: 80,
      isOpen: true,
      deliveryTime: '45-60 min',
      minimumOrder: 5,
      deliveryFee: 3.99,
      categories: ['Medicines', 'Vitamins', 'First Aid']
    }
  ];

  // Mock banners data
  private mockBanners: Banner[] = [
    {
      id: '1',
      title: 'Fresh Fruits Sale',
      description: 'Get 25% off on all fresh fruits',
      image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/category/1',
      linkType: 'category',
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      priority: 1
    },
    {
      id: '2',
      title: 'Free Delivery',
      description: 'Free delivery on orders above ₹500',
      image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      link: '/offers/free-delivery',
      linkType: 'external',
      isActive: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      priority: 2
    }
  ];

  // Mock cart data
  private mockCart: Cart = {
    items: [
      {
        id: '1',
        productId: '1',
        name: 'Organic Apples',
        price: 2.99,
        originalPrice: 3.99,
        image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        quantity: 2,
        category: 'grocery',
        storeId: '1',
        availableQty: 50
      }
    ],
    storeId: '1',
    storeName: 'Fresh Grocery Store',
    subtotal: 5.98,
    deliveryFee: 2.99,
    discount: 1.00,
    total: 7.97,
    itemCount: 2
  };

  // Mock orders data
  private mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD001',
      userId: 'user1',
      storeId: '1',
      storeName: 'Fresh Grocery Store',
      items: [
        {
          id: '1',
          productId: '1',
          name: 'Organic Apples',
          price: 2.99,
          quantity: 2,
          image: 'https://images.pexels.com/photos/2093087/pexels-photo-2093087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      status: 'delivered',
      orderType: 'Home Delivery',
      address: {
        id: '1',
        type: 'home',
        name: 'Home',
        houseNumber: '123',
        apartment: 'Apartment 4B, Green Park Colony',
        directions: 'Near the red gate, ring the bell',
        isDefault: true,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Green Park Colony, New Delhi, Delhi 110016'
        }
      },
      orderDate: '2024-01-15T10:30:00Z',
      deliveryDate: '2024-01-15T11:15:00Z',
      itemTotal: 5.98,
      deliveryFee: 2.99,
      discount: 1.00,
      grandTotal: 7.97,
      paymentMode: 'Credit Card',
      paymentStatus: 'completed',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-01-15T11:30:00Z'
    }
  ];

  // Mock user profile data
  private mockUserProfile: UserProfile = {
    id: 'user1',
    customerId: 'cust-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobile: '+91-9876543210',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    mobileVerified: true,
    emailVerified: true,
    // isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-01-15T09:00:00Z',
    iat: 1710000000,
    exp: 1712592000,
    addresses: [
      {
        id: '1',
        type: 'home',
        name: 'Home',
        houseNumber: '123',
        apartment: 'Apartment 4B, Green Park Colony',
        directions: 'Near the red gate, ring the bell',
        isDefault: true,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Green Park Colony, New Delhi, Delhi 110016'
        }
      }
    ],
    preferences: {
      language: 'en',
      currency: 'INR',
      notifications: {
        push: true,
        email: true,
        sms: false
      }
    }
  };

  // Mock wishlist data
  private mockWishlist: WishlistItem[] = [
    {
      id: '1',
      productId: '2',
      product: this.mockProducts[1],
      addedAt: '2024-01-15T10:30:00Z'
    }
  ];

  // Mock notifications data
  private mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Order Delivered',
      message: 'Your order ORD001 has been delivered successfully',
      type: 'order',
      isRead: false,
      createdAt: '2024-01-15T11:15:00Z'
    }
  ];

  // Product methods
  async getProducts(): Promise<ApiResponse<Product[]>> {
    await mockDelay();
    return mockSuccess(this.mockProducts);
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    await mockDelay();
    const product = this.mockProducts.find(p => p.id === id);
    if (!product) {
      return mockError('Product not found');
    }
    return mockSuccess(product);
  }

  async getProductsByCategory(categoryId: string): Promise<ApiResponse<Product[]>> {
    await mockDelay();
    const category = this.mockCategories.find(c => c.id === categoryId);
    if (!category) {
      return mockError('Category not found');
    }
    const products = category.subCategories.flatMap(sc => sc.products);
    return mockSuccess(products);
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    await mockDelay();
    const products = this.mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    );
    return mockSuccess(products);
  }

  // Category methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    await mockDelay();
    return mockSuccess(this.mockCategories);
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    await mockDelay();
    const category = this.mockCategories.find(c => c.id === id);
    if (!category) {
      return mockError('Category not found');
    }
    return mockSuccess(category);
  }

  // Store methods
  async getStores(): Promise<ApiResponse<Store[]>> {
    await mockDelay();
    return mockSuccess(this.mockStores);
  }

  async getStoreById(id: string): Promise<ApiResponse<Store>> {
    await mockDelay();
    const store = this.mockStores.find(s => s.id === id);
    if (!store) {
      return mockError('Store not found');
    }
    return mockSuccess(store);
  }

  // Banner methods
  async getBanners(): Promise<ApiResponse<Banner[]>> {
    await mockDelay();
    return mockSuccess(this.mockBanners);
  }

  async getBannerById(id: string): Promise<ApiResponse<Banner>> {
    await mockDelay();
    const banner = this.mockBanners.find(b => b.id === id);
    if (!banner) {
      return mockError('Banner not found');
    }
    return mockSuccess(banner);
  }

  // Cart methods
  async getCart(): Promise<ApiResponse<Cart>> {
    await mockDelay();
    return mockSuccess(this.mockCart);
  }

  async addToCart(item: { productId: string; quantity: number }): Promise<ApiResponse<Cart>> {
    await mockDelay();
    const product = this.mockProducts.find(p => p.id === item.productId);
    if (!product) {
      return mockError('Product not found');
    }

    const existingItem = this.mockCart.items.find(i => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.mockCart.items.push({
        id: Date.now().toString(),
        productId: item.productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: item.quantity,
        category: product.category,
        storeId: this.mockCart.storeId,
        availableQty: product.availableQty
      });
    }

    // Recalculate totals
    this.mockCart.subtotal = this.mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.mockCart.total = this.mockCart.subtotal + this.mockCart.deliveryFee - this.mockCart.discount;
    this.mockCart.itemCount = this.mockCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return mockSuccess(this.mockCart);
  }

  // Order methods
  async getOrders(): Promise<ApiResponse<Order[]>> {
    await mockDelay();
    return mockSuccess(this.mockOrders);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    await mockDelay();
    const order = this.mockOrders.find(o => o.id === id);
    if (!order) {
      return mockError('Order not found');
    }
    return mockSuccess(order);
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    await mockDelay();
    return mockSuccess(this.mockUserProfile);
  }

  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    await mockDelay();
    return mockSuccess(this.mockWishlist);
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await mockDelay();
    return mockSuccess(this.mockNotifications);
  }

  // Utility methods
  async simulateError(message: string = 'Mock error occurred'): Promise<ApiResponse<any>> {
    await mockDelay();
    return mockError(message);
  }

  async simulateNetworkError(): Promise<ApiResponse<any>> {
    await mockDelay();
    return mockError('Network error occurred. Please check your connection.');
  }

  async simulateTimeout(): Promise<ApiResponse<any>> {
    await mockDelay(5000);
    return mockError('Request timeout');
  }

  // Mock authentication methods
  async sendOTP(mobile: string): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
    await mockDelay(1500);
    
    // Mock successful OTP send
    return mockSuccess({
      message: 'OTP sent successfully',
      otpKey: `mock-otp-key-${mobile}`
    });
  }

  async verifyOTP(mobile: string, otp: string, otpKey: string): Promise<ApiResponse<{ status: string; data: { token: string; user: any } }>> {
    await mockDelay(2000);
    
    // Mock OTP verification - accept any 6-digit OTP
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      return mockSuccess({
        status: 'success',
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            mobile: mobile,
            mobileVerified: true,
            emailVerified: true,
            image: null,
            customerId: 'mock-customer-id',
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      });
    } else {
      return mockError('Invalid OTP');
    }
  }

  async checkPhoneExists(phone: string): Promise<ApiResponse<{ exists: boolean }>> {
    await mockDelay(800);
    
    // Mock phone check - assume phone numbers ending with 0 are registered
    const exists = phone.endsWith('0');
    return mockSuccess({ exists });
  }

  async registerUser(userData: {
    mobile: string; // Changed from 'phone'
    firstName: string;
    lastName: string;
    email: string;
    otp?: string;
  }): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
    await mockDelay(2000);
    
    // For registration without OTP, just return success with otpKey
    if (!userData.otp) {
      return mockSuccess({
        message: 'User registered successfully',
        otpKey: `mock-otp-key-${userData.mobile}`
      });
    }
    
    // For registration with OTP, validate it
    if (userData.otp.length === 6 && /^\d{6}$/.test(userData.otp)) {
      return mockSuccess({
        message: 'User registered successfully',
        otpKey: `mock-otp-key-${userData.mobile}`
      });
    } else {
      return mockError('Invalid OTP');
    }
  }
}

// Create singleton instance
export const mockDataService = new MockDataService();
export default mockDataService; 