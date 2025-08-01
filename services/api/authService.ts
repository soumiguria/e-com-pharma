// // services/api/authService.ts
// import apiClient from './client';
// import { mockDataService } from './mockDataService';
// import { 
//   ApiResponse, 
//   AuthResponse, 
//   LoginRequest, 
//   SendOTPRequest, 
//   User, 
//   UserProfile 
// } from './types';

// // Use mock data service for development
// const USE_MOCK_DATA = false; // Set to false to use real API

// export class AuthService {
//   // Send OTP to phone number
//   async sendOTP(mobile: string): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
//     if (USE_MOCK_DATA) {
//       return mockDataService.sendOTP(mobile);
//     }
    
//     // API expects 'mobile' field
//     const request = { mobile };
    
//     try {
//       console.log('Trying request with:', request);
//       const response = await apiClient.post<{ message: string; otpKey?: string }>('/v1/customer/login', request);
//       console.log('API Response:', response);
//       return response;
//     } catch (error) {
//       console.log('Failed with request:', request, 'Error:', error);
//       return {
//         success: false,
//         error: 'Failed to send OTP. Please check your mobile number.',
//         data: null as any,
//       };
//     }
//   }

//   // Verify OTP and login
//   async verifyOTP(mobile: string, otp: string, otpKey: string): Promise<ApiResponse<AuthResponse>> {
//     if (USE_MOCK_DATA) {
//       return mockDataService.verifyOTP(mobile, otp, otpKey);
//     }
    
//     // API expects 'otpKey' and 'otp' fields
//     const request = { otpKey, otp };
    
//     try {
//       console.log('Trying verify OTP with:', request);
//       const response = await apiClient.post<AuthResponse>('/v1/customer/verify-otp', request);
//       console.log('Verify OTP Response:', response);
//       return response;
//     } catch (error) {
//       console.log('Failed verify OTP with request:', request, 'Error:', error);
//       return {
//         success: false,
//         error: 'Failed to verify OTP. Please try again.',
//         data: null as any,
//       };
//     }
//   }

//   // Register new user
//   async registerUser(userData: {
//     mobile: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//     otp: string;
//   }): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
//     if (USE_MOCK_DATA) {
//       return mockDataService.registerUser(userData);
//     }
    
//     // API expects 'mobile' field
//     const request = {
//       mobile: userData.mobile,
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//       email: userData.email,
//       otp: userData.otp
//     };
    
//     try {
//       console.log('Trying register with:', request);
//       const response = await apiClient.post<{ message: string; otpKey?: string }>('/v1/customer/register', request);
//       console.log('Register Response:', response);
//       return response;
//     } catch (error) {
//       console.log('Failed register with request:', request, 'Error:', error);
//       return {
//         success: false,
//         error: 'Failed to register user. Please try again.',
//         data: null as any,
//       };
//     }
//   }

//   // Get current user profile
//   async getProfile(): Promise<ApiResponse<UserProfile>> {
//     return apiClient.get<UserProfile>('/v1/customer/self');
//   }

//   // Update user profile
//   async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
//     return apiClient.put<UserProfile>('/v1/customer/self', profileData);
//   }

//   // Update user preferences
//   async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<ApiResponse<UserProfile>> {
//     return apiClient.patch<UserProfile>('/v1/customer/preferences', preferences);
//   }

//   // Upload profile image
//   async uploadProfileImage(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ imageUrl: string }>> {
//     return apiClient.uploadFile<{ imageUrl: string }>('/v1/customer/profile-image', file);
//   }

//   // Logout
//   async logout(): Promise<ApiResponse<{ message: string }>> {
//     return apiClient.post<{ message: string }>('/v1/customer/logout');
//   }

//   // Refresh token
//   async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
//     return apiClient.post<{ token: string; refreshToken: string }>('/v1/customer/refresh');
//   }

//   // Delete account
//   async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
//     return apiClient.delete<{ message: string }>('/v1/customer/account');
//   }

//   // Check if phone number exists (for login flow)
//   async checkPhoneExists(mobile: string): Promise<ApiResponse<{ exists: boolean }>> {
//     if (USE_MOCK_DATA) {
//       return mockDataService.checkPhoneExists(mobile);
//     }
//     // Try to login with mobile number to check if user exists
//     try {
//       const response = await this.sendOTP(mobile);
//       return {
//         success: true,
//         data: { exists: response.success },
//       };
//     } catch (error) {
//       return {
//         success: false,
//         data: { exists: false },
//         error: 'Failed to check mobile number',
//       };
//     }
//   }

//   // Request password reset (if implementing password-based auth later)
//   async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
//     return apiClient.post<{ message: string }>('/v1/customer/forgot-password', { email });
//   }

//   // Reset password (if implementing password-based auth later)
//   async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
//     return apiClient.post<{ message: string }>('/v1/customer/reset-password', { token, newPassword });
//   }
// }

// // Create singleton instance
// export const authService = new AuthService();
// export default authService; 


// services/api/authService.ts
import apiClient from './client';
import { mockDataService } from './mockDataService';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SendOTPRequest,
  User,
  UserProfile
} from './types';

const USE_MOCK_DATA = false;

export class AuthService {
  async sendOTP(mobile: string): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
    if (USE_MOCK_DATA) {
      return mockDataService.sendOTP(mobile);
    }

    const request = { mobile };

    try {
      console.log('📤 Sending OTP Request with:', request);
      const response = await apiClient.post<any>('/v1/customer/login', request);
      console.log('✅ OTP API Response:', JSON.stringify(response, null, 2));
      
      // Handle nested response structure
      if (response.success && response.data) {
        // Check if response.data has nested data structure
        const actualData = response.data.data || response.data;
        const otpKey = actualData?.otpKey;
        
        return {
          success: true,
          data: {
            message: 'OTP sent successfully',
            otpKey: otpKey
          }
        };
      }
      
      return response;
    } catch (error: any) {
      console.log('❌ OTP API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to send OTP. Please check your mobile number.',
        data: null as any,
      };
    }
  }

  async verifyOTP(mobile: string, otp: string, otpKey: string): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCK_DATA) {
      const mockResult = await mockDataService.verifyOTP(mobile, otp, otpKey);
      return {
        success: mockResult.success,
        data: {
          success: true,
          data: {
            status: 'success',
            token: mockResult.data?.data?.token || 'mock-token',
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            mobile: mobile,
            email: 'john@example.com',
            mobileVerified: true,
            emailVerified: true,
            image: null,
            customerId: 'mock-customer-id',
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
          }
        },
        error: mockResult.error,
      };
    }

    const request = { otpKey, otp };

    try {
      console.log('📤 Verifying OTP with:', request);
      const response = await apiClient.post<any>('/v1/customer/verify-otp', request);
      console.log('✅ Verify OTP Response:', JSON.stringify(response, null, 2));
      
      // Handle the actual API response structure
      if (response.success && response.data) {
        // The actual API returns: { status: "success", data: { token: "..." } }
        const apiData = response.data;
        
        if (apiData.status === 'success' && apiData.data?.token) {
          return {
            success: true,
            data: {
              success: true,
              data: {
                status: 'success',
                token: apiData.data.token,
                // Extract user info from JWT token if needed
                ...apiData.data
              }
            }
          };
        } else {
          return {
            success: false,
            error: 'Invalid response format from server',
            data: null as any,
          };
        }
      }
      
      return response;
    } catch (error: any) {
      console.log('❌ Verify OTP Error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to verify OTP. Please try again.',
        data: null as any,
      };
    }
  }

  async registerUser(userData: {
    mobile: string;
    firstName: string;
    lastName: string;
    email: string;
    otp?: string;
  }): Promise<ApiResponse<{ message: string; otpKey?: string }>> {
    if (USE_MOCK_DATA) {
      return mockDataService.registerUser(userData);
    }

    const request = {
      mobile: userData.mobile,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      ...(userData.otp && { otp: userData.otp })
    };

    try {
      console.log('📤 Registering user with:', request);
      const response = await apiClient.post<any>('/v1/customer/register', request);
      console.log('✅ Register Response:', JSON.stringify(response, null, 2));
      
      // Handle nested response structure
      if (response.success && response.data) {
        // Check if response.data has nested data structure
        const actualData = response.data.data || response.data;
        const otpKey = actualData?.otpKey;
        
        return {
          success: true,
          data: {
            message: 'User registered successfully',
            otpKey: otpKey
          }
        };
      }
      
      return response;
    } catch (error: any) {
      console.log('❌ Register Error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to register user. Please try again.',
        data: null as any,
      };
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/v1/customer/self');
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/v1/customer/self', profileData);
  }

  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>('/v1/customer/preferences', preferences);
  }

  async uploadProfileImage(file: { uri: string; type: string; name: string }): Promise<ApiResponse<{ imageUrl: string }>> {
    return apiClient.uploadFile<{ imageUrl: string }>('/v1/customer/profile-image', file);
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/v1/customer/logout');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return apiClient.post<{ token: string; refreshToken: string }>('/v1/customer/refresh');
  }

  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>('/v1/customer/account');
  }

  async checkPhoneExists(mobile: string): Promise<ApiResponse<{ exists: boolean }>> {
    if (USE_MOCK_DATA) {
      return mockDataService.checkPhoneExists(mobile);
    }

    try {
      const response = await this.sendOTP(mobile);
      return {
        success: true,
        data: { exists: response.success },
      };
    } catch (error: any) {
      console.log('❌ Check phone exists error:', error.response?.data || error.message);
      return {
        success: false,
        data: { exists: false },
        error: 'Failed to check mobile number',
      };
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/v1/customer/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/v1/customer/reset-password', { token, newPassword });
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
