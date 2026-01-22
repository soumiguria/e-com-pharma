// services/api/storeProductService.ts
import apiClient from './client';
import { ApiResponse, Product, ExtendedProduct, Category, SubCategory } from './types';
import { API_CONFIG, buildApiUrl, isApiEnabled } from './config';

// Helpers to normalize backend shapes to UI-friendly shapes
const PLACEHOLDER_IMAGE = 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=800';

// Helper function to build full image URL from relative path
const buildImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return PLACEHOLDER_IMAGE;
  
  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path (starts with /), prepend base URL
  if (imagePath.startsWith('/')) {
    const fullUrl = `${API_CONFIG.BASE_URL}${imagePath}`;
    console.log('🖼️ Building image URL:', { original: imagePath, full: fullUrl });
    return fullUrl;
  }
  
  // Otherwise, assume it's already a full URL or return placeholder
  return imagePath || PLACEHOLDER_IMAGE;
};

const mapCategory = (raw: any): Category => {
  return {
    id: raw.categoryId || raw.id || String(raw.categoryERPId || raw.subcategoryERPId || Math.random()),
    name: raw.name || raw.title || 'Category',
    image: buildImageUrl(raw.signedImage || raw.image),
    description: raw.description || undefined,
    isActive: raw.status ? String(raw.status).toLowerCase() === 'active' : true,
    subCategories: [],
  } as Category;
};

const mapSubCategory = (raw: any): SubCategory => {
  return {
    id: raw.subcategoryId || raw.id || String(raw.subcategoryERPId || Math.random()),
    name: raw.name || 'Subcategory',
    image: buildImageUrl(raw.signedImage || raw.image),
    description: raw.description || undefined,
    parentCategoryId: raw.categoryId || raw.category?.categoryId,
    products: [],
  } as SubCategory;
};

const toNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

// Helper to parse quantity - handles string numbers like "150"
const parseQuantity = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0 ? val : 0;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const num = parseInt(trimmed, 10);
    return !isNaN(num) && num > 0 ? num : 0;
  }
  return 0;
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
  // Priority: signedImage > signedImages[0] > image > images[0] > placeholder
  if (raw.signedImage) return buildImageUrl(raw.signedImage);
  if (Array.isArray(raw.signedImages) && raw.signedImages.length > 0) return buildImageUrl(raw.signedImages[0]);
  if (raw.image) return buildImageUrl(raw.image);
  if (Array.isArray(raw.images) && raw.images.length > 0) return buildImageUrl(raw.images[0]);
  return PLACEHOLDER_IMAGE;
};

const mapProduct = (raw: any, category: 'grocery' | 'pharma'): Product => {
  // Handle images array: prefer signedImages, fallback to images
  // Build full URLs for all images in the array
  const rawImagesArray = raw.signedImages || raw.images || undefined;
  const imagesArray = Array.isArray(rawImagesArray) 
    ? rawImagesArray.map((img: string) => buildImageUrl(img))
    : undefined;
  
  // Ensure primary image is set - use first image from array if pickImage returns placeholder
  const primaryImage = pickImage(raw);
  const finalImage = primaryImage === PLACEHOLDER_IMAGE && imagesArray && imagesArray.length > 0
    ? imagesArray[0]
    : primaryImage;
  
  return {
    id: raw.productId || raw.id || String(Math.random()),
    name: raw.name || raw.productName || 'Product',
    price: pickPrice(raw),
    originalPrice: (() => { const n = toNumber(raw.mrp); return n > 0 ? n : undefined; })(),
    image: finalImage,
    images: imagesArray,
    description: raw.description || undefined,
    brand: raw.brand || raw.brandName || undefined,
    category,
    subCategory: raw.subcategoryId || raw.subCategoryId || undefined,
    availableQty: parseQuantity(raw.availableQty ?? raw.stock ?? raw.quantity),
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
      console.log('   API disabled for grocery categories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_CATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapCategory) : [];
      console.log(' Grocery categories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Category[]>;
    } catch (error) {
      console.log('  Grocery categories API error:', error);
      console.log('   Error fetching grocery categories');
      throw error;
    }
  }

  async getGrocerySubcategories(storeId: string): Promise<ApiResponse<SubCategory[]>> {
    console.log('🛒 Fetching grocery subcategories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('   API disabled for grocery subcategories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_SUBCATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapSubCategory) : [];
      console.log(' Grocery subcategories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<SubCategory[]>;
    } catch (error) {
      console.log('  Grocery subcategories API error:', error);
      console.log('   Error fetching grocery subcategories');
      throw error;
    }
  }

  async getGroceryProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    console.log('🛒 Fetching grocery products for store:', storeId);

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for grocery products');
      throw new Error('API_DISABLED');
    }

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'grocery')) : [];
      console.log(' Grocery products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Grocery products API error:', error);
      console.log('   Error fetching grocery products');
      throw error;
    }
  }

  async getGroceryProductsBySubcategory(storeId: string, subcategoryId: string): Promise<ApiResponse<Product[]>> {
    console.log('🛒 Fetching grocery products for subcategory:', { storeId, subcategoryId });

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for grocery products');
      throw new Error('API_DISABLED');
    }

    try {
      // Use products endpoint and filter by subcategoryId
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      
      // Filter raw data by subcategoryId before mapping
      // Check multiple possible locations: direct property, nested object, or subcategories array
      const rawProducts = Array.isArray(raw?.data) ? raw.data : [];
      const filteredRaw = rawProducts.filter((p: any) => {
        // Check direct properties
        if (p.subcategoryId === subcategoryId || p.subCategoryId === subcategoryId) {
          return true;
        }
        
        // Check nested subcategory object
        if (p.subcategory?.subcategoryId === subcategoryId || p.subcategory?.id === subcategoryId) {
          return true;
        }
        
        // Check subcategories array (API returns subcategories as an array)
        if (Array.isArray(p.subcategories)) {
          const hasMatchingSubcategory = p.subcategories.some((sub: any) => 
            sub.subcategoryId === subcategoryId || 
            sub.id === subcategoryId ||
            sub.subcategoryERPId === subcategoryId
          );
          if (hasMatchingSubcategory) {
            return true;
          }
        }
        
        return false;
      });
      
      const mapped = filteredRaw.map((p: any) => mapProduct(p, 'grocery'));
      
      console.log(`🛒 Filtered ${mapped.length} grocery products for subcategory ${subcategoryId} from ${rawProducts.length} total products`);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Grocery products API error:', error);
      console.log('   Error fetching grocery products');
      throw error;
    }
  }

  async getGroceryProductDetails(storeId: string, productId: string): Promise<ApiResponse<ExtendedProduct>> {
    console.log('🛒 Fetching grocery product details:', { storeId, productId });
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for grocery product details');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCT_DETAILS, { storeId, productId });
      const response = await apiClient.get<any>(url);
      const raw = response.data?.data || response.data;
      const mapped = mapExtendedProduct(raw, 'grocery');
      console.log(' Grocery product details API mapped');
      return { success: true, data: mapped } as ApiResponse<ExtendedProduct>;
    } catch (error) {
      console.log('  Grocery product details API error:', error);
      console.log('   Error fetching grocery product details');
      throw error;
    }
  }

  // PHARMA APIs
  async getPharmaCategories(storeId: string): Promise<ApiResponse<Category[]>> {
    console.log('💊 Fetching pharma categories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('   API disabled for pharma categories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_CATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapCategory) : [];
      console.log(' Pharma categories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Category[]>;
    } catch (error) {
      console.log('  Pharma categories API error:', error);
      console.log('   Error fetching pharma categories');
      throw error;
    }
  }

  async getPharmaSubcategories(storeId: string): Promise<ApiResponse<SubCategory[]>> {
    console.log('💊 Fetching pharma subcategories for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_CATEGORIES')) {
      console.log('   API disabled for pharma subcategories');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_SUBCATEGORIES, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map(mapSubCategory) : [];
      console.log(' Pharma subcategories API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<SubCategory[]>;
    } catch (error) {
      console.log('  Pharma subcategories API error:', error);
      console.log('   Error fetching pharma subcategories');
      throw error;
    }
  }

  async getPharmaProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    console.log('💊 Fetching pharma products for store:', storeId);
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for pharma products');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'pharma')) : [];
      console.log(' Pharma products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Pharma products API error:', error);
      console.log('   Error fetching pharma products');
      throw error;
    }
  }

  async getPharmaProductDetails(storeId: string, productId: string): Promise<ApiResponse<ExtendedProduct>> {
    console.log('💊 Fetching pharma product details:', { storeId, productId });
    
    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for pharma product details');
      throw new Error('API_DISABLED');
    }
    
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCT_DETAILS, { storeId, productId });
      const response = await apiClient.get<any>(url);
      const raw = response.data?.data || response.data;
      const mapped = mapExtendedProduct(raw, 'pharma');
      console.log(' Pharma product details API mapped');
      return { success: true, data: mapped } as ApiResponse<ExtendedProduct>;
    } catch (error) {
      console.log('  Pharma product details API error:', error);
      console.log('   Error fetching pharma product details');
      throw error;
    }
  }

  async getPharmaProductsBySubcategory(storeId: string, subcategoryId: string): Promise<ApiResponse<Product[]>> {
    console.log('💊 Fetching pharma products for subcategory:', { storeId, subcategoryId });

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for pharma products');
      throw new Error('API_DISABLED');
    }

    try {
      // Use products endpoint and filter by subcategoryId
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCTS, { storeId });
      const response = await apiClient.get<any>(url);
      const raw = response.data;
      
      // Filter raw data by subcategoryId before mapping
      // Check multiple possible locations: direct property, nested object, or subcategories array
      const rawProducts = Array.isArray(raw?.data) ? raw.data : [];
      const filteredRaw = rawProducts.filter((p: any) => {
        // Check direct properties
        if (p.subcategoryId === subcategoryId || p.subCategoryId === subcategoryId) {
          return true;
        }
        
        // Check nested subcategory object
        if (p.subcategory?.subcategoryId === subcategoryId || p.subcategory?.id === subcategoryId) {
          return true;
        }
        
        // Check subcategories array (API returns subcategories as an array)
        if (Array.isArray(p.subcategories)) {
          const hasMatchingSubcategory = p.subcategories.some((sub: any) => 
            sub.subcategoryId === subcategoryId || 
            sub.id === subcategoryId ||
            sub.subcategoryERPId === subcategoryId
          );
          if (hasMatchingSubcategory) {
            return true;
          }
        }
        
        return false;
      });
      
      const mapped = filteredRaw.map((p: any) => mapProduct(p, 'pharma'));
      
      console.log(`💊 Filtered ${mapped.length} pharma products for subcategory ${subcategoryId} from ${rawProducts.length} total products`);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Pharma products API error:', error);
      console.log('   Error fetching pharma products');
      throw error;
    }
  }

  async getFilteredPharmaProducts(storeId: string, filters: { brand?: string }): Promise<ApiResponse<Product[]>> {
    console.log('💊 Fetching filtered pharma products:', { storeId, filters });

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for filtered pharma products');
      throw new Error('API_DISABLED');
    }

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.PHARMA_PRODUCTS, { storeId });
      const response = await apiClient.post<any>(url, { filters });
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'pharma')) : [];
      console.log(' Filtered pharma products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Filtered pharma products API error:', error);
      console.log('   Error fetching filtered pharma products');
      throw error;
    }
  }

  async getFilteredGroceryProducts(storeId: string, filters: { brand?: string }): Promise<ApiResponse<Product[]>> {
    console.log('🛒 Fetching filtered grocery products:', { storeId, filters });

    if (!isApiEnabled('USE_REAL_PRODUCTS')) {
      console.log('   API disabled for filtered grocery products');
      throw new Error('API_DISABLED');
    }

    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.GROCERY_PRODUCTS, { storeId });
      const response = await apiClient.post<any>(url, { filters });
      const raw = response.data;
      const mapped = Array.isArray(raw?.data) ? raw.data.map((p: any) => mapProduct(p, 'grocery')) : [];
      console.log(' Filtered grocery products API mapped:', mapped.length);
      return { success: true, data: mapped } as ApiResponse<Product[]>;
    } catch (error) {
      console.log('  Filtered grocery products API error:', error);
      console.log('   Error fetching filtered grocery products');
      throw error;
    }
  }
}

export const storeProductService = new StoreProductService();
