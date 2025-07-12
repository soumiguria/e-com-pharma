// services/api/bannerService.ts
import apiClient from './client';
import { 
  ApiResponse, 
  Banner 
} from './types';

export class BannerService {
  // Get all banners
  async getBanners(params?: {
    type?: string;
    location?: string;
    isActive?: boolean;
    limit?: number;
  }): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>('/banners', params);
  }

  // Get banner by ID
  async getBannerById(bannerId: string): Promise<ApiResponse<Banner>> {
    return apiClient.get<Banner>(`/banners/${bannerId}`);
  }

  // Get banners by location
  async getBannersByLocation(location: string): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>('/banners/by-location', { location });
  }

  // Get home page banners
  async getHomeBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>('/banners/home');
  }

  // Get category banners
  async getCategoryBanners(categoryId: string): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>(`/banners/category/${categoryId}`);
  }

  // Get promotional banners
  async getPromotionalBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>('/banners/promotional');
  }

  // Track banner click
  async trackBannerClick(bannerId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/banners/${bannerId}/click`);
  }

  // Track banner impression
  async trackBannerImpression(bannerId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/banners/${bannerId}/impression`);
  }

  // Get banner analytics
  async getBannerAnalytics(bannerId: string): Promise<ApiResponse<{
    bannerId: string;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    views: number;
  }>> {
    return apiClient.get<{
      bannerId: string;
      impressions: number;
      clicks: number;
      clickThroughRate: number;
      views: number;
    }>(`/banners/${bannerId}/analytics`);
  }
}

// Create singleton instance
export const bannerService = new BannerService();
export default bannerService; 