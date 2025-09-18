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
        'marg-customer-token': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('📋 Fetching orders...');
      console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'No token');

      const response = await axios.get('https://marg-api.thelocalsandbox.dev/v1/customer/order?page=1&limit=10&orders[createdAt]=desc', {
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
      console.error(' Error fetching orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders',
        data: [],
      };
    }
  }

  async getOrderById(orderId: string): Promise<ApiResponse<any>> {
    try {
      const token = await this.getAuthToken();
      const headers = {
        'marg-customer-token': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const url = `https://marg-api.thelocalsandbox.dev/v1/customer/order/${orderId}`;
      console.log('📦 Fetching order detail:', url);
      const response = await axios.get(url, { headers });

      if (!response.data || !response.data.data) {
        return { success: false, error: 'No order found', data: null as any };
      }

      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.error(' Error fetching order detail:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order',
        data: null as any,
      };
    }
  }
}

export default new OrderListService();
