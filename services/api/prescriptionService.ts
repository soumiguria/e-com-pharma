import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from './types';

export type PrescriptionFile = {
  uri: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
};

/**
 * Prescription Service - Handles prescription file validation and storage
 * Features:
 * - File size validation (max 1MB)
 * - File type validation (images and PDF only)
 * - Local storage of prescription for cart items
 * - Auto-upload to API when order is placed
 */
class PrescriptionService {
  private readonly MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB
  private readonly STORAGE_KEY = 'prescription_cart_data';

  /**
   * Validate prescription file
   * @param file Prescription file to validate
   * @returns Validation result with error message if invalid
   */
  async validateFile(file: PrescriptionFile): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      // Check file size
      if (!file.sizeBytes) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(file.uri);
          if (fileInfo.size === undefined) {
            return {
              valid: false,
              error: 'Unable to determine file size',
            };
          }
          file.sizeBytes = fileInfo.size;
        } catch (error) {
          console.warn('getInfoAsync failed, attempting legacy approach:', error);
          // If the new approach fails, try getting file size from the system
          // For now, we'll estimate or require the caller to provide sizeBytes
          return {
            valid: false,
            error: 'Unable to determine file size. Please try again.',
          };
        }
      }

      // Validate file size (1KB max)
      if (file.sizeBytes > this.MAX_FILE_SIZE_BYTES) {
        const sizeInKB = (file.sizeBytes / 1024).toFixed(2);
        return {
          valid: false,
          error: `File size ${sizeInKB}KB exceeds 1KB limit. Please select a smaller file.`,
        };
      }

      // Validate file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
      ];

      const normalizedMimeType = file.mimeType.toLowerCase();
      if (!allowedMimeTypes.includes(normalizedMimeType)) {
        return {
          valid: false,
          error: 'Invalid file type. Please upload an image (JPG, PNG, WebP, GIF) or PDF.',
        };
      }

      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Failed to validate file',
      };
    }
  }

  /**
   * Store prescription in local storage for order
   * @param orderId Order ID to associate prescription with
   * @param file Prescription file
   */
  async storePrescriptionForOrder(orderId: string, file: PrescriptionFile): Promise<void> {
    try {
      const existing = await this.getPrescriptionForOrder(orderId);
      const updatedData = {
        ...existing,
        [orderId]: {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          storedAt: new Date().toISOString(),
        },
      };
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(updatedData)
      );
      console.log('💊 Prescription stored locally for order:', orderId);
    } catch (error) {
      console.error('❌ Error storing prescription:', error);
      throw error;
    }
  }

  /**
   * Get stored prescription for an order
   * @param orderId Order ID to retrieve prescription for
   */
  async getPrescriptionForOrder(orderId: string): Promise<PrescriptionFile | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return parsed[orderId] || null;
    } catch (error) {
      console.error('❌ Error retrieving prescription:', error);
      return null;
    }
  }

  /**
   * Remove prescription for an order (after successful upload)
   * @param orderId Order ID to remove prescription for
   */
  async removePrescriptionForOrder(orderId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return;

      const parsed = JSON.parse(data);
      delete parsed[orderId];
      
      if (Object.keys(parsed).length === 0) {
        await AsyncStorage.removeItem(this.STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(parsed)
        );
      }
      console.log('💊 Prescription removed for order:', orderId);
    } catch (error) {
      console.error('❌ Error removing prescription:', error);
    }
  }

  /**
   * Get all stored prescriptions
   */
  async getAllPrescriptions(): Promise<Record<string, PrescriptionFile>> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error retrieving all prescriptions:', error);
      return {};
    }
  }

  /**
   * Clear all stored prescriptions
   */
  async clearAllPrescriptions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('💊 All prescriptions cleared');
    } catch (error) {
      console.error('❌ Error clearing prescriptions:', error);
    }
  }

  /**
   * Get readable file size
   */
  getReadableFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    const kb = bytes / 1024;
    return `${kb.toFixed(2)}KB`;
  }
}

export const prescriptionService = new PrescriptionService();
export default prescriptionService;
