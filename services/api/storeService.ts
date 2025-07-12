// services/api/storeService.ts
import apiClient from './client';
import { 
  ApiResponse, 
  Store, 
  StoreDetail, 
  StoreSelectionParams,
  PaginatedResponse,
  PaginationParams,
  Location
} from './types';

export class StoreService {
  // Get stores by pincode
  async getStoresByPincode(pincode: string, category?: 'grocery' | 'pharmacy'): Promise<ApiResponse<Store[]>> {
    const params: Record<string, any> = { pincode };
    if (category) {
      params.category = category;
    }
    return apiClient.get<Store[]>('/stores/by-pincode', params);
  }

  // Get stores by location
  async getStoresByLocation(location: Location, category?: 'grocery' | 'pharmacy'): Promise<ApiResponse<Store[]>> {
    const params: Record<string, any> = {
      latitude: location.latitude,
      longitude: location.longitude,
    };
    if (category) {
      params.category = category;
    }
    return apiClient.get<Store[]>('/stores/by-location', params);
  }

  // Get store details
  async getStoreDetails(storeId: string): Promise<ApiResponse<StoreDetail>> {
    return apiClient.get<StoreDetail>(`/stores/${storeId}`);
  }

  // Get nearby stores
  async getNearbyStores(latitude: number, longitude: number, radius: number = 5): Promise<ApiResponse<Store[]>> {
    return apiClient.get<Store[]>('/stores/nearby', { latitude, longitude, radius });
  }

  // Search stores
  async searchStores(query: string, location?: Location): Promise<ApiResponse<Store[]>> {
    const params: Record<string, any> = { query };
    if (location) {
      params.latitude = location.latitude;
      params.longitude = location.longitude;
    }
    return apiClient.get<Store[]>('/stores/search', params);
  }

  // Get stores with pagination
  async getStores(params: PaginationParams & { category?: 'grocery' | 'pharmacy' }): Promise<ApiResponse<PaginatedResponse<Store>>> {
    return apiClient.get<PaginatedResponse<Store>>('/stores', params);
  }

  // Get store reviews
  async getStoreReviews(storeId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<StoreDetail['reviews'][0]>>> {
    return apiClient.get<PaginatedResponse<StoreDetail['reviews'][0]>>(`/stores/${storeId}/reviews`, { page, limit });
  }

  // Add store review
  async addStoreReview(storeId: string, rating: number, comment: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/stores/${storeId}/reviews`, { rating, comment });
  }

  // Get store categories
  async getStoreCategories(storeId: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`/stores/${storeId}/categories`);
  }

  // Get store working hours
  async getStoreWorkingHours(storeId: string): Promise<ApiResponse<StoreDetail['workingHours']>> {
    return apiClient.get<StoreDetail['workingHours']>(`/stores/${storeId}/working-hours`);
  }

  // Check store availability
  async checkStoreAvailability(storeId: string): Promise<ApiResponse<{ isOpen: boolean; nextOpenTime?: string }>> {
    return apiClient.get<{ isOpen: boolean; nextOpenTime?: string }>(`/stores/${storeId}/availability`);
  }

  // Get store delivery options
  async getStoreDeliveryOptions(storeId: string): Promise<ApiResponse<{
    deliveryMethods: Array<{
      id: string;
      name: string;
      description: string;
      deliveryTime: string;
      deliveryFee: number;
      minimumOrder: number;
    }>;
  }>> {
    return apiClient.get<{
      deliveryMethods: Array<{
        id: string;
        name: string;
        description: string;
        deliveryTime: string;
        deliveryFee: number;
        minimumOrder: number;
      }>;
    }>(`/stores/${storeId}/delivery-options`);
  }

  // Get store contact information
  async getStoreContactInfo(storeId: string): Promise<ApiResponse<{
    phone: string;
    email: string;
    address: string;
    location: { latitude: number; longitude: number };
  }>> {
    return apiClient.get<{
      phone: string;
      email: string;
      address: string;
      location: { latitude: number; longitude: number };
    }>(`/stores/${storeId}/contact`);
  }

  // Get store images
  async getStoreImages(storeId: string): Promise<ApiResponse<{ images: string[] }>> {
    return apiClient.get<{ images: string[] }>(`/stores/${storeId}/images`);
  }

  // Get store statistics
  async getStoreStats(storeId: string): Promise<ApiResponse<{
    totalProducts: number;
    totalOrders: number;
    averageRating: number;
    totalReviews: number;
    deliveryTime: string;
  }>> {
    return apiClient.get<{
      totalProducts: number;
      totalOrders: number;
      averageRating: number;
      totalReviews: number;
      deliveryTime: string;
    }>(`/stores/${storeId}/stats`);
  }

  // Get popular stores
  async getPopularStores(category?: 'grocery' | 'pharmacy', limit: number = 10): Promise<ApiResponse<Store[]>> {
    const params: Record<string, any> = { limit };
    if (category) {
      params.category = category;
    }
    return apiClient.get<Store[]>('/stores/popular', params);
  }

  // Get trending stores
  async getTrendingStores(category?: 'grocery' | 'pharmacy', limit: number = 10): Promise<ApiResponse<Store[]>> {
    const params: Record<string, any> = { limit };
    if (category) {
      params.category = category;
    }
    return apiClient.get<Store[]>('/stores/trending', params);
  }

  // Get store recommendations
  async getStoreRecommendations(userId: string, limit: number = 10): Promise<ApiResponse<Store[]>> {
    return apiClient.get<Store[]>('/stores/recommendations', { userId, limit });
  }

  // Follow/unfollow store
  async toggleStoreFollow(storeId: string): Promise<ApiResponse<{ isFollowing: boolean }>> {
    return apiClient.post<{ isFollowing: boolean }>(`/stores/${storeId}/follow`);
  }

  // Get followed stores
  async getFollowedStores(): Promise<ApiResponse<Store[]>> {
    return apiClient.get<Store[]>('/stores/followed');
  }

  // Get store notifications settings
  async getStoreNotificationSettings(storeId: string): Promise<ApiResponse<{
    orderUpdates: boolean;
    promotions: boolean;
    newProducts: boolean;
  }>> {
    return apiClient.get<{
      orderUpdates: boolean;
      promotions: boolean;
      newProducts: boolean;
    }>(`/stores/${storeId}/notification-settings`);
  }

  // Update store notifications settings
  async updateStoreNotificationSettings(
    storeId: string, 
    settings: {
      orderUpdates?: boolean;
      promotions?: boolean;
      newProducts?: boolean;
    }
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.patch<{ message: string }>(`/stores/${storeId}/notification-settings`, settings);
  }
}

// Create singleton instance
export const storeService = new StoreService();
export default storeService; 