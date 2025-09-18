// services/api/storeProductService.ts
import apiClient from './client';
import { ApiResponse, Product, ExtendedProduct, Category, SubCategory } from './types';
import { API_CONFIG, buildApiUrl, isApiEnabled } from './config';

// Helpers to normalize backend shapes to UI-friendly shapes
const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800';

const mapCategory = (raw: any): Category => {
  return {
    id: raw.categoryId || raw.id || String(raw.categoryERPId || raw.subcategoryERPId || Math.random()),
    name: raw.name || raw.title || 'Category',
    image: raw.image || PLACEHOLDER_IMAGE,
    description: raw.description || undefined,
    isActive: raw.status ? String(raw.status).toLowerCase() === 'active' : true,
    subCategories: [],
  } as Category;
};

const mapSubCategory = (raw: any): SubCategory => {
  return {
    id: raw.subcategoryId || raw.id || String(raw.subcategoryERPId || Math.random()),
    name: raw.name || 'Subcategory',
    image: raw.image || PLACEHOLDER_IMAGE,
    description: raw.description || undefined,
    parentCategoryId: raw.categoryId || raw.category?.categoryId,
    products: [],
  } as SubCategory;
};

const toNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const pickPrice = (raw: any): number => {
  // Prefer selling price fields; backend may send strings like 'sp' and 'mrp'
  const candidates = [raw.sp, raw.price, raw.sellingPrice, raw.salePrice, raw.mrp, raw.maxRetailPrice];
  for (const c of candidates) {
    const n = toNumber(c);
    if (n > 0) return n;
  }
  return 0;
};

const pickImage = (raw: any): string => {
  return raw.image || (Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : PLACEHOLDER_IMAGE);
};

const mapProduct = (raw: any, category: 'grocery' | 'pharma'): Product => {
  return {
    id: raw.productId || raw.id || String(Math.random()),
    name: raw.name || raw.productName || 'Product',
    price: pickPrice(raw),
    originalPrice: (() => { const n = toNumber(raw.mrp); return n > 0 ? n : undefined; })(),
    image: pickImage(raw),
    images: raw.images || undefined,
    description: raw.description || undefined,
    brand: raw.brand || raw.brandName || undefined,
    category,
    subCategory: raw.subcategoryId || raw.subCategoryId || undefined,
    availableQty: raw.availableQty ?? raw.stock ?? raw.quantity ?? 0,
    unit: raw.unit || raw.unitOfMeasure || 'unit',
    weight: raw.weight || undefined,
    expiryDate: raw.expiryDate || undefined,
    isAvailable: raw.isAvailable ?? true,
    isOnSale: raw.isOnSale ?? false,
    discountPercentage: raw.discountPercentage || undefined,
    rating: raw.rating || undefined,
    reviewCount: raw.reviewCount || undefined,
    variants: raw.variants || undefined,
    tags: raw.tags || undefined,
  } as Product;
};

const mapExtendedProduct = (raw: any, category: 'grocery' | 'pharma'): ExtendedProduct => {
  const base = mapProduct(raw, category);
  return {
    ...base,
    similarProducts: Array.isArray(raw.similarProducts) ? raw.similarProducts.map((p: any) => mapProduct(p, category)) : undefined,
    reviews: raw.reviews || undefined,
    specifications: raw.specifications || undefined,
  } as ExtendedProduct;
};

export class StoreProductService {
  // GROCERY APIs
  async getGroceryCategories(storeId: string): Promise<ApiResponse<Category[]>> {
    console.log('🛒 Fetching grocery categories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('📊 API disabled, using fallback mock data for grocery categories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_CATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapCategory) : [];
      console.log('✅ Grocery categories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Category[]>;
    } catch (error) {
      console.log('❌ Grocery categories API error:', error);
      console.log('📊 Using fallback mock data for grocery categories');
      throw error;
    }
  }

  async getGrocerySubcategories(storeId: string): Promise<ApiResponse<SubCategory[]>> {
    console.log('🛒 Fetching grocery subcategories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('📊 API disabled, using fallback mock data for grocery subcategories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_SUBCATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapSubCategory) : [];
      console.log('✅ Grocery subcategories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<SubCategory[]>;
    } catch (error) {
      console.log('❌ Grocery subcategories API error:', error);
      console.log('📊 Using fallback mock data for grocery subcategories');
      throw error;
    }
  }

  async getGroceryProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    console.log('🛒 Fetching grocery products for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('📊 API disabled, using fallback mock data for grocery products');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'grocery')) : [];
      console.log('✅ Grocery products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('❌ Grocery products API error:', error);
      console.log('📊 Using fallback mock data for grocery products');
      throw error;
    }
  }

  async getGroceryProductDetails(storeId: string, productId: string): Promise<ApiResponse<ExtendedProduct>> {
    console.log('🛒 Fetching grocery product details:', { storeId, productId });
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('📊 API disabled, using fallback mock data for grocery product details');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCT_DETAILS, { storeId, productId });
      const response = await apiClient.get<any>(url);
      const raw = response.data?.data || response.data;
      const mapped = mapExtendedProduct(raw, 'grocery');
      console.log('✅ Grocery product details API mapped');
      return { success: true, data: mapped } as ApiResponse<ExtendedProduct>;
    } catch (error) {
      console.log('❌ Grocery product details API error:', error);
      console.log('📊 Using fallback mock data for grocery product details');
      throw error;
    }
  }

  // PHARMA APIs
  async getPharmaCategories(storeId: string): Promise<ApiResponse<Category[]>> {
    console.log('💊 Fetching pharma categories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('📊 API disabled, using fallback mock data for pharma categories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_CATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapCategory) : [];
      console.log('✅ Pharma categories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Category[]>;
    } catch (error) {
      console.log('❌ Pharma categories API error:', error);
      console.log('📊 Using fallback mock data for pharma categories');
      throw error;
    }
  }

  async getPharmaSubcategories(storeId: string): Promise<ApiResponse<SubCategory[]>> {
    console.log('💊 Fetching pharma subcategories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('📊 API disabled, using fallback mock data for pharma subcategories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_SUBCATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapSubCategory) : [];
      console.log('✅ Pharma subcategories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<SubCategory[]>;
    } catch (error) {
      console.log('❌ Pharma subcategories API error:', error);
      console.log('📊 Using fallback mock data for pharma subcategories');
      throw error;
    }
  }

  async getPharmaProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    console.log('💊 Fetching pharma products for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('📊 API disabled, using fallback mock data for pharma products');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'pharma')) : [];
      console.log('✅ Pharma products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('❌ Pharma products API error:', error);
      console.log('📊 Using fallback mock data for pharma products');
      throw error;
    }
  }

  async getPharmaProductDetails(storeId: string, productId: string): Promise<ApiResponse<ExtendedProduct>> {
    console.log('💊 Fetching pharma product details:', { storeId, productId });
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('📊 API disabled, using fallback mock data for pharma product details');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCT_DETAILS, { storeId, productId });
      const response = await apiClient.get<any>(url);
      const raw = response.data?.data || response.data;
      const mapped = mapExtendedProduct(raw, 'pharma');
      console.log('✅ Pharma product details API mapped');
      return { success: true, data: mapped } as ApiResponse<ExtendedProduct>;
    } catch (error) {
      console.log('❌ Pharma product details API error:', error);
      console.log('📊 Using fallback mock data for pharma product details');
      throw error;
    }
  }

  async getPharmaProductsBySubcategory(storeId: string, subcategoryId: string): Promise<ApiResponse<Product[]>> {
    console.log('💊 Fetching pharma products for subcategory:', { storeId, subcategoryId });

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('📊 API disabled, using fallback mock data for pharma products');
      throw new Error('API_DISABLED');
    }

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_SUBCATEGORIES, { storeId, subcategoryId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'pharma')) : [];
      console.log('✅ Pharma products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('❌ Pharma products API error:', error);
      console.log('📊 Using fallback mock data for pharma products');
      throw error;
    }
  }
}

export const storeProductService = new StoreProductService();
