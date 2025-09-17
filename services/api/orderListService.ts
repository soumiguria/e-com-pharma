// services/api/orderListService.ts
import axios from 'axios';
import { ApiResponse } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderListItem {
  orderId: number;
  orderNo: string;
  customerId: string;
  paymentId: string;
  deliveryMethod: string;
  shippingAddress: any;
  billingAddress: any;
  products: Array<{
    sp: number;
    mrp: number;
    tax: number;
    name: string;
    actual: number;
    images: {
      primary: string;
    };
    taxRate: number;
    quantity: number;
    productId: number;
    signedImages?: {
      primary: string;
    };
  }>;
  storeDiscount: string;
  couponDiscount: string;
  shippingAmount: string;
  taxAmount: string;
  subtotalAmount: string;
  totalAmount: string;
  otpRequired: boolean;
  otp: string;
  isOtpVerified: boolean;
  expressDelivery: boolean;
  timeslotId: string | null;
  timeslotDate: string | null;
  timeslot: any;
  status: string;
  activities: Array<{
    status: string;
    message: string;
    timestamp: number;
  }>;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  payment?: {
    paymentId: number;
    type: string;
    mode: string;
    amount: string;
    pgName: string;
    pgReferenceId: string;
    pgPaymentId: string | null;
    status: string;
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    pgKey?: string;
  };
}

class OrderListService {
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  async getOrders(): Promise<ApiResponse<OrderListItem[]>> {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'gc-seller-token': `Bearer ${token}`,
        'gc-customer-token': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjcwMDM1NDQ1MjciLCJjdXN0b21lcklkIjozLCJzZWxsZXJJZCI6MSwiaWF0IjoxNzU3Njg3NzU5LCJleHAiOjE3NTc3MjM3NTl9.H5lWQytQcayKb8rfERIElT8O5JyRT4TmRsXH-GynbmM`,
        'origin': 'https://www.earthenlume.com',
        'Content-Type': 'application/json',
      };

      console.log('📋 Fetching orders...');
      console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'No token');

      const response = await axios.get('https://api.grocup.com/v1/store/customer/order?page=all&limit=0&orders[orderId]=desc', {
        headers,
      });

      console.log('📊 Orders API response:', response.data);

      if (!response.data || !response.data.data) {
        console.log('⚠️ Orders API returned null data, creating mock response');
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: true,
        data: response.data.data as OrderListItem[],
      };
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders',
        data: [],
      };
    }
  }
}

export default new OrderListService();
