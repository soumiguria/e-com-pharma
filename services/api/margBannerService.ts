// services/api/margBannerService.ts
import axios from 'axios';
import { ApiResponse } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { MARG_ERP_CONFIG } from '../../config/appConfig';
import pako from 'pako';
import * as FileSystem from 'expo-file-system/legacy';

export interface MargBanner {
  id: string;
  image: string;
  title?: string;
  description?: string;
}

interface MargBannerRequest {
  date: string;
  DType: string;
  Adtype: string;
  ImageYN: string;
  CompanyID: string;
  IMEI: string;
}

interface MargBannerResponse {
  Data: any; // Will contain banner data/URLs
  CompData: string;
  Status: string;
  ErrorCode: string | null;
  ErrorMessage: string | null;
}

class MargBannerService {
  private baseURL = MARG_ERP_CONFIG.BaseURL;
  private endpoint = MARG_ERP_CONFIG.Endpoint;

  /**
   * Get unique device identifier
   * For now, using a combination of platform + timestamp as fallback
   * In production, consider using react-native-device-info
   */
  private async getDeviceIMEI(): Promise<string> {
    try {
      // Try to get stored IMEI
      const storedIMEI = await AsyncStorage.getItem('device_imei');
      if (storedIMEI) {
        return storedIMEI;
      }

      // Generate a unique ID based on platform and timestamp
      const uniqueId = `${Platform.OS}-${Date.now()}`;
      await AsyncStorage.setItem('device_imei', uniqueId);
      return uniqueId;
    } catch (error) {
      console.error('Error getting device IMEI:', error);
      // Fallback ID
      return `device-${Platform.OS}-${Date.now()}`;
    }
  }

  /**
   * Get company ID from app config or storage
   * Defaults to a standard value if not found
   */
  private async getCompanyID(): Promise<string> {
    try {
      const storedCompanyID = await AsyncStorage.getItem('company_id');
      if (storedCompanyID) {
        return storedCompanyID;
      }
      // Use config company ID
      return MARG_ERP_CONFIG.CompanyID || MARG_ERP_CONFIG.DefaultCompanyID;
    } catch (error) {
      console.error('Error getting company ID:', error);
      return MARG_ERP_CONFIG.DefaultCompanyID;
    }
  }

  /**
   * Fetch banners from MargERP API
   */
  async getBanners(): Promise<ApiResponse<MargBanner[]>> {
    console.log('🖼️ Fetching banners from MargERP API');

    try {
      // Send request with correct parameters from backend
      const requestBody: MargBannerRequest = {
        date: '',
        DType: 'PAASKIDUKAAN',      // Store type
        Adtype: 'BANNER',            // Ad type
        ImageYN: '',
        CompanyID: '',
        IMEI: '',
      };

      console.log('📤 MargERP Banner Request (DType: PAASKIDUKAAN, Adtype: BANNER)');

      const response = await axios.post<MargBannerResponse>(
        `${this.baseURL}${this.endpoint}`,
        requestBody,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('📥 MargERP Banner Response Status:', response.data.Status);
      console.log('📥 Data field:', response.data.Data ? `Present (length: ${String(response.data.Data).length})` : 'NULL');
      console.log('📥 CompData field:', response.data.CompData ? `Present (length: ${response.data.CompData.length})` : 'NULL');
      console.log('📥 Full Response Keys:', Object.keys(response.data));

      // Check if the API call was successful
      if (response.data.Status === 'Success' || response.data.Status === 'success') {
        // Try Data first, if null/empty try CompData
        let bannerData = response.data.Data;
        
        if (!bannerData && response.data.CompData) {
          console.log('📊 Data is null/empty, using CompData instead');
          bannerData = response.data.CompData;
        }
        
        // Check if we have actual data
        if (!bannerData || (typeof bannerData === 'string' && bannerData.trim() === '')) {
          console.warn('⚠️ API returned Success but no banner data in Data or CompData');
          return {
            success: false,
            data: [],
            error: 'No banner data returned from API',
          };
        }
        
        if (bannerData) {
          console.log('🔄 Calling parseMargBanners with data type:', typeof bannerData, 'Length:', String(bannerData).length);
          const banners = await this.parseMargBanners(bannerData);
          console.log('✅ Successfully parsed banners:', banners.length);
          return {
            success: true,
            data: banners,
          };
        } else {
          console.warn('⚠️ MargERP API returned Success but no Data or CompData');
          return {
            success: false,
            data: [],
            error: 'No banner data in response',
          };
        }
      } else {
        const errorMsg = response.data.ErrorMessage || 'Failed to fetch banners';
        console.warn(
          '⚠️ MargERP API returned status:',
          response.data.Status,
          errorMsg
        );
        return {
          success: false,
          data: [],
          error: errorMsg,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch banners from MargERP';
      console.error('❌ Error fetching banners from MargERP:', errorMessage);
      return {
        success: false,
        data: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Detect image type from Base64 header/magic bytes
   * Returns the file extension based on actual image format
   */
  private detectImageExtension(base64Data: string): string {
    const prefix = base64Data.substring(0, 20); // First 20 chars are usually enough
    
    console.log('🔍 Detecting image type from Base64 header...');
    console.log('   Prefix:', prefix);
    
    // PNG: starts with "iVBORw0KGgo" (hex: 89 50 4E 47...)
    if (base64Data.startsWith('iVBORw0KGgo')) {
      console.log('   ✅ Detected: PNG');
      return 'png';
    }
    
    // JPEG: starts with "/9j/" (hex: FF D8 FF...)
    if (base64Data.startsWith('/9j/')) {
      console.log('   ✅ Detected: JPEG');
      return 'jpg';
    }
    
    // WebP: starts with "UklGR" (hex: 52 49 46 46 57 45 42 50)
    if (base64Data.startsWith('UklGR')) {
      console.log('   ✅ Detected: WebP');
      return 'webp';
    }
    
    // GIF: starts with "R0lGODlh" (hex: 47 49 46 38)
    if (base64Data.startsWith('R0lGODlh')) {
      console.log('   ✅ Detected: GIF');
      return 'gif';
    }
    
    // BMP: starts with "Qk0" (hex: 42 4D)
    if (base64Data.startsWith('Qk0')) {
      console.log('   ✅ Detected: BMP');
      return 'bmp';
    }
    
    // If we can't detect, log the actual hex bytes for debugging
    console.warn('   ⚠️ Unknown image type, attempting to decode header...');
    try {
      const binaryStart = atob(prefix);
      const hexBytes = Array.from({ length: Math.min(8, binaryStart.length) })
        .map((_, i) => '0x' + binaryStart.charCodeAt(i).toString(16).padStart(2, '0'))
        .join(' ');
      console.warn('   Hex bytes:', hexBytes);
    } catch (e) {
      console.warn('   Could not decode header');
    }
    
    // Default to jpg as many ERP systems use JPEG
    console.warn('   🔄 Defaulting to JPEG');
    return 'jpg';
  }

  /**
   * Convert base64 image to file URI
   * Saves the base64 data to app's cache directory with correct extension
   */
  private async base64ToFileUri(base64Data: string): Promise<string> {
    try {
      // Detect actual image type
      const imageExt = this.detectImageExtension(base64Data);
      const fileName = `banner_${Date.now()}.${imageExt}`;
      // Use documentDirectory as fallback since cacheDirectory might not exist in some versions
      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      
      if (!cacheDir) {
        throw new Error('No valid file system directory available');
      }
      
      const filePath = `${cacheDir}${fileName}`;
      
      console.log('💾 Saving base64 image to file:', filePath);
      
      // Clean base64 string - remove all whitespace and newlines
      const cleanedBase64 = base64Data.replace(/\s/g, '');
      console.log('   Original base64 length:', base64Data.length);
      console.log('   Cleaned base64 length:', cleanedBase64.length);
      console.log('   Image extension:', imageExt);
      
      // Validate base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedBase64)) {
        throw new Error('Invalid base64 format after cleaning');
      }
      console.log('   Base64 format validated ✓');
      
      // Write base64 data to file using legacy API
      await FileSystem.writeAsStringAsync(filePath, cleanedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('   Write operation completed');
      
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      console.log('📋 File info:', {
        exists: fileInfo.exists,
        // size: fileInfo.size,
        isDirectory: fileInfo.isDirectory,
      });
      
      if (!fileInfo.exists) {
        throw new Error(`File was not created at: ${filePath}`);
      }
      
      // Calculate expected size: base64 decoded is roughly 75% of original
      const expectedSize = Math.floor(cleanedBase64.length * 0.75);
      const actualSize = fileInfo.size || 0;
      const sizeMatch = Math.abs(actualSize - expectedSize) < 1000; // Allow 1KB variance
      
      console.log('✅ Successfully saved image to:', filePath);
      console.log('   Expected size:', expectedSize, 'bytes (approx)');
      console.log('   Actual size:', actualSize, 'bytes');
      console.log('   Size match:', sizeMatch);
      
      return filePath; // Return the file path directly
    } catch (error) {
      console.error('❌ Error saving base64 to file:', error);
      throw error;
    }
  }

  /**
   * Try to decompress base64 data using zlib
   * Returns original if decompression fails (data is not compressed)
   */
  private tryDecompressBase64Data(base64Data: string): string {
    try {
      console.log('🔓 Attempting to decompress base64 data...');
      console.log('   Input length:', base64Data.length);
      
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      
      // Check for zlib magic number (0x78 is typical)
      const firstByte = binaryString.charCodeAt(0);
      console.log('   First byte (hex):', '0x' + firstByte.toString(16));
      
      if (firstByte !== 0x78) {
        console.log('⚠️ Not zlib compressed data (no 0x78 magic). Returning original.');
        return base64Data;
      }
      
      // Convert binary string to bytes
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decompress using pako
      const decompressed = pako.inflate(bytes, { to: 'string' });
      console.log('✅ Successfully decompressed data to:', decompressed.length, 'bytes');
      
      return decompressed;
    } catch (error) {
      console.error('❌ Error decompressing data:', error);
      console.log('   Data is likely not compressed. Using original.');
      // Return original if decompression fails
      return base64Data;
    }
  }

  /**
   * Parse banner data from MargERP response
   * Handles: JSON strings, comma/pipe separated URLs, base64 encoded images
   */
  private async parseMargBanners(data: any): Promise<MargBanner[]> {
    try {
      console.log('📋 Raw banner data type:', typeof data);
      console.log('   Data length:', String(data).length);
      
      let bannerArray: any[] = [];
      let processedData = data;
      
      // If data is a string, try to decompress/parse it
      if (typeof data === 'string') {
        console.log('🔍 Detected string data, checking if compressed...');
        
        // Check if it looks like base64
        const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(data.trim());
        console.log('   Is Base64:', isBase64);
        
        if (isBase64 && data.length > 100) {
          console.log('   Attempting decompression...');
          // Try to decompress first
          const decompressed = this.tryDecompressBase64Data(data);
          
          // If decompression produced different data, use it
          if (decompressed !== data) {
            processedData = decompressed;
            console.log('📦 Using decompressed data');
          } else {
            processedData = data;
            console.log('ℹ️ Data is base64 image (not compressed). Using as-is.');
          }
        }
      }
      
      console.log('📊 Processing data after decompression check');
      
      // Now parse the processed data
      if (typeof processedData === 'string') {
        // Check if it's base64 image data
        const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(processedData.trim());
        
        if (isBase64 && processedData.length > 100) {
          console.log('🖼️ Base64 image data detected, saving to file...');
          
          try {
            // Convert base64 to file URI
            const fileUri = await this.base64ToFileUri(processedData);
            console.log('   File URI:', fileUri);
            
            bannerArray = [{
              id: 'banner_0',
              image: fileUri, // Use file:// URI instead of data URI
            }];
          } catch (error) {
            console.error('❌ Failed to convert base64 to file URI:', error);
            // Fallback: try data URI anyway
            const imageDataUri = `data:image/png;base64,${processedData}`;
            bannerArray = [{
              id: 'banner_0',
              image: imageDataUri,
            }];
          }
        } else {
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(processedData);
            bannerArray = Array.isArray(parsed) ? parsed : [parsed];
            console.log('✅ Successfully parsed as JSON, array length:', bannerArray.length);
          } catch (e) {
            console.log('⚠️ Not JSON, treating as comma-separated or pipe-separated URLs');
            // Try comma or pipe separated URLs
            const urls = processedData.split(/[,|]/).map((url: string) => url.trim()).filter((url: string) => url.length > 0);
            console.log('   Found URLs:', urls.length);
            bannerArray = urls.map((url: string, idx: number) => ({
              image: url,
              id: `banner_${idx}`,
            }));
          }
        }
      } else if (Array.isArray(processedData)) {
        console.log('   Data is already an array, length:', processedData.length);
        bannerArray = processedData;
      } else if (typeof processedData === 'object' && processedData !== null) {
        console.log('   Data is an object, wrapping in array');
        bannerArray = [processedData];
      }
      
      console.log('📊 Banner array length before filtering:', bannerArray.length);

      const parsed = bannerArray
        .filter((item: any) => item && (item.image || item.ImageUrl || item.bannerImage || item.url || item.URL))
        .map((item: any, index: number) => {
          let imageUri = item.image || item.ImageUrl || item.bannerImage || item.url || item.URL || '';
          
          // For base64 data URIs, ensure proper format for React Native
          // If it's a file URI or http(s), leave as is
          if (imageUri.startsWith('file://') || imageUri.startsWith('http') || imageUri.startsWith('/')) {
            // Already in correct format
            console.log(`   Banner ${index + 1}: Using ${imageUri.startsWith('file://') ? 'file' : 'http'} URI`);
          } else if (imageUri.startsWith('data:image')) {
            // Data URI - will try to work but might fail on native
            console.log(`   Banner ${index + 1}: Using data URI (${imageUri.length} chars)`);
          } else if (/^[A-Za-z0-9+/]*={0,2}$/.test(imageUri.trim())) {
            // Raw base64 without URI prefix - add data URI
            imageUri = `data:image/png;base64,${imageUri}`;
            console.log(`   Banner ${index + 1}: Added PNG data URI prefix`);
          }
          
          return {
            id: item.id || item.ID || `banner_${index}`,
            image: imageUri,
            title: item.title || item.Title || item.bannerTitle || '',
            description: item.description || item.Description || item.bannerDescription || '',
          };
        })
        .filter((banner: MargBanner) => banner.image); // Only include banners with images
      
      console.log('✅ Successfully parsed banners count:', parsed.length);
      parsed.forEach((banner, idx) => {
        const preview = banner.image.startsWith('file://') 
          ? `[file URI]`
          : banner.image.startsWith('data:') 
          ? `[data URI, ${banner.image.length} chars]`
          : banner.image.substring(0, 60);
        console.log(`   Banner ${idx + 1}: ID=${banner.id}, Preview=${preview}...`);
      });
      
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing MargERP banners:', error);
      console.error('   Error details:', (error as any).message);
      return [];
    }
  }

  /**
   * Set company ID (can be called during app initialization)
   */
  async setCompanyID(companyID: string): Promise<void> {
    try {
      await AsyncStorage.setItem('company_id', companyID);
      console.log('✅ Company ID saved:', companyID);
    } catch (error) {
      console.error('Error setting company ID:', error);
    }
  }

  /**
   * Set device IMEI (can be called if you have a way to get it)
   */
  async setDeviceIMEI(imei: string): Promise<void> {
    try {
      await AsyncStorage.setItem('device_imei', imei);
      console.log('✅ Device IMEI saved:', imei);
    } catch (error) {
      console.error('Error setting device IMEI:', error);
    }
  }
}

export const margBannerService = new MargBannerService();
