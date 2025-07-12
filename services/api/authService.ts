// services/api/authService.ts
import apiClient from './client';
import { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  SendOTPRequest, 
  User, 
  UserProfile 
} from './types';

export class AuthService {
  // Send OTP to phone number
  async sendOTP(phone: string): Promise<ApiResponse<{ message: string }>> {
    const request: SendOTPRequest = { phone };
    return apiClient.post<{ message: string }>('/auth/send-otp', request);
  }

  // Verify OTP and login
  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const request: LoginRequest = { phone, otp };
    return apiClient.post<AuthResponse>('/auth/verify-otp', request);
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/auth/profile');
  }

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/auth/profile', profileData);
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>('/auth/preferences', preferences);
  }

  // Upload profile image
  async uploadProfileImage(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ imageUrl: string }>> {
    return apiClient.uploadFile<{ imageUrl: string }>('/auth/profile-image', file);
  }

  // Logout
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/logout');
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh');
  }

  // Delete account
  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/auth/account');
  }

  // Check if phone number exists
  async checkPhoneExists(phone: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get<{ exists: boolean }>('/auth/check-phone', { phone });
  }

  // Request password reset (if implementing password-based auth later)
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  }

  // Reset password (if implementing password-based auth later)
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService; 