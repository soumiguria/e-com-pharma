// services/api/orderService.ts
import apiClient from './client';
import { 
  ApiResponse, 
  Order, 
  PaginatedResponse,
  PaginationParams,
  Address,
  PaymentMethod
} from './types';

export class OrderService {
  // Create order
  async createOrder(orderData: {
    storeId: string;
    items: Array<{
      productId: string;
      quantity: number;
      variantId?: string;
    }>;
    deliveryAddress: Address;
    deliveryMethod: string;
    deliverySlot?: string;
    paymentMethod: string;
    couponCode?: string;
    specialInstructions?: string;
  }): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>('/orders', orderData);
  }

  // Get user orders
  async getOrders(params?: PaginationParams & {
    status?: Order['status'];
    storeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return apiClient.get<PaginatedResponse<Order>>('/orders', params);
  }

  // Get order details
  async getOrderDetails(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/orders/${orderId}/cancel`, { reason });
  }

  // Track order
  async trackOrder(orderId: string): Promise<ApiResponse<{
    orderId: string;
    status: Order['status'];
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
    updates: Array<{
      status: Order['status'];
      timestamp: string;
      message: string;
      location?: string;
    }>;
  }>> {
    return apiClient.get<{
      orderId: string;
      status: Order['status'];
      trackingNumber?: string;
      estimatedDelivery?: string;
      currentLocation?: string;
      updates: Array<{
        status: Order['status'];
        timestamp: string;
        message: string;
        location?: string;
      }>;
    }>(`/orders/${orderId}/track`);
  }

  // Reorder
  async reorder(orderId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/orders/${orderId}/reorder`);
  }

  // Rate order
  async rateOrder(
    orderId: string, 
    rating: number, 
    comment?: string,
    itemRatings?: Array<{
      itemId: string;
      rating: number;
      comment?: string;
    }>
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/orders/${orderId}/rate`, {
      rating,
      comment,
      itemRatings,
    });
  }

  // Get order invoice
  async getOrderInvoice(orderId: string): Promise<ApiResponse<{ invoiceUrl: string }>> {
    return apiClient.get<{ invoiceUrl: string }>(`/orders/${orderId}/invoice`);
  }

  // Download order invoice
  async downloadOrderInvoice(orderId: string): Promise<ApiResponse<{ filePath: string }>> {
    return apiClient.get<{ filePath: string }>(`/orders/${orderId}/invoice/download`);
  }

  // Get order history
  async getOrderHistory(limit: number = 20): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/orders/history', { limit });
  }

  // Get order statistics
  async getOrderStatistics(): Promise<ApiResponse<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    ordersThisMonth: number;
    ordersThisYear: number;
    favoriteStores: Array<{
      storeId: string;
      storeName: string;
      orderCount: number;
    }>;
  }>> {
    return apiClient.get<{
      totalOrders: number;
      totalSpent: number;
      averageOrderValue: number;
      ordersThisMonth: number;
      ordersThisYear: number;
      favoriteStores: Array<{
        storeId: string;
        storeName: string;
        orderCount: number;
      }>;
    }>('/orders/statistics');
  }

  // Get order by tracking number
  async getOrderByTrackingNumber(trackingNumber: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>('/orders/by-tracking', { trackingNumber });
  }

  // Request order return
  async requestReturn(
    orderId: string, 
    items: Array<{
      itemId: string;
      quantity: number;
      reason: string;
    }>
  ): Promise<ApiResponse<{ returnId: string; message: string }>> {
    return apiClient.post<{ returnId: string; message: string }>(`/orders/${orderId}/return`, { items });
  }

  // Get return status
  async getReturnStatus(returnId: string): Promise<ApiResponse<{
    returnId: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    items: Array<{
      itemId: string;
      quantity: number;
      reason: string;
      status: 'pending' | 'approved' | 'rejected';
    }>;
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed' | 'completed';
    pickupDate?: string;
  }>> {
    return apiClient.get<{
      returnId: string;
      status: 'pending' | 'approved' | 'rejected' | 'completed';
      items: Array<{
        itemId: string;
        quantity: number;
        reason: string;
        status: 'pending' | 'approved' | 'rejected';
      }>;
      refundAmount?: number;
      refundStatus?: 'pending' | 'processed' | 'completed';
      pickupDate?: string;
    }>(`/returns/${returnId}`);
  }

  // Cancel return request
  async cancelReturn(returnId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/returns/${returnId}/cancel`);
  }

  // Get payment methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get<PaymentMethod[]>('/orders/payment-methods');
  }

  // Get delivery slots
  async getDeliverySlots(storeId: string, date?: string): Promise<ApiResponse<Array<{
    id: string;
    timeSlot: string;
    isAvailable: boolean;
    deliveryFee: number;
    maxOrders: number;
    currentOrders: number;
  }>>> {
    const params = date ? { storeId, date } : { storeId };
    return apiClient.get<Array<{
      id: string;
      timeSlot: string;
      isAvailable: boolean;
      deliveryFee: number;
      maxOrders: number;
      currentOrders: number;
    }>>('/orders/delivery-slots', params);
  }

  // Get order notifications
  async getOrderNotifications(orderId: string): Promise<ApiResponse<Array<{
    id: string;
    type: 'status_update' | 'delivery_update' | 'payment_update';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }>>> {
    return apiClient.get<Array<{
      id: string;
      type: 'status_update' | 'delivery_update' | 'payment_update';
      title: string;
      message: string;
      timestamp: string;
      isRead: boolean;
    }>>(`/orders/${orderId}/notifications`);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.patch<{ message: string }>(`/notifications/${notificationId}/read`);
  }

  // Get order support
  async getOrderSupport(orderId: string): Promise<ApiResponse<{
    orderId: string;
    supportOptions: Array<{
      id: string;
      title: string;
      description: string;
      available: boolean;
    }>;
    contactInfo: {
      phone: string;
      email: string;
      chatAvailable: boolean;
    };
  }>> {
    return apiClient.get<{
      orderId: string;
      supportOptions: Array<{
        id: string;
        title: string;
        description: string;
        available: boolean;
      }>;
      contactInfo: {
        phone: string;
        email: string;
        chatAvailable: boolean;
      };
    }>(`/orders/${orderId}/support`);
  }

  // Create support ticket
  async createSupportTicket(
    orderId: string, 
    issue: string, 
    description: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<ApiResponse<{ ticketId: string; message: string }>> {
    return apiClient.post<{ ticketId: string; message: string }>(`/orders/${orderId}/support-ticket`, {
      issue,
      description,
      priority,
    });
  }

  // Get support ticket status
  async getSupportTicketStatus(ticketId: string): Promise<ApiResponse<{
    ticketId: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    subject: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    responses: Array<{
      id: string;
      message: string;
      sender: 'user' | 'support';
      timestamp: string;
    }>;
  }>> {
    return apiClient.get<{
      ticketId: string;
      status: 'open' | 'in_progress' | 'resolved' | 'closed';
      priority: 'low' | 'medium' | 'high';
      subject: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      responses: Array<{
        id: string;
        message: string;
        sender: 'user' | 'support';
        timestamp: string;
      }>;
    }>(`/support/tickets/${ticketId}`);
  }

  // Add response to support ticket
  async addSupportTicketResponse(
    ticketId: string, 
    message: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`/support/tickets/${ticketId}/respond`, { message });
  }
}

// Create singleton instance
export const orderService = new OrderService();
export default orderService; 