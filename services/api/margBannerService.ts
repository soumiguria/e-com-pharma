// // // services/api/margBannerService.ts
// // import axios from 'axios';
// // import { ApiResponse } from './types';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Platform } from 'react-native';
// // import { MARG_ERP_CONFIG } from '../../config/appConfig';
// // import pako from 'pako';
// // import * as FileSystem from 'expo-file-system/legacy';

// // export interface MargBanner {
// //   id: string;
// //   image: string;
// //   title?: string;
// //   description?: string;
// // }

// // interface MargBannerRequest {
// //   date: string;
// //   DType: string;
// //   Adtype: string;
// //   ImageYN: string;
// //   CompanyID: string;
// //   IMEI: string;
// // }

// // interface MargBannerResponse {
// //   Data: any; // Will contain banner data/URLs
// //   CompData: string;
// //   Status: string;
// //   ErrorCode: string | null;
// //   ErrorMessage: string | null;
// // }

// // class MargBannerService {
// //   private baseURL = MARG_ERP_CONFIG.BaseURL;
// //   private endpoint = MARG_ERP_CONFIG.Endpoint;

// //   /**
// //    * Get unique device identifier
// //    * For now, using a combination of platform + timestamp as fallback
// //    * In production, consider using react-native-device-info
// //    */
// //   private async getDeviceIMEI(): Promise<string> {
// //     try {
// //       // Try to get stored IMEI
// //       const storedIMEI = await AsyncStorage.getItem('device_imei');
// //       if (storedIMEI) {
// //         return storedIMEI;
// //       }

// //       // Generate a unique ID based on platform and timestamp
// //       const uniqueId = `${Platform.OS}-${Date.now()}`;
// //       await AsyncStorage.setItem('device_imei', uniqueId);
// //       return uniqueId;
// //     } catch (error) {
// //       console.error('Error getting device IMEI:', error);
// //       // Fallback ID
// //       return `device-${Platform.OS}-${Date.now()}`;
// //     }
// //   }

// //   /**
// //    * Get company ID from app config or storage
// //    * Defaults to a standard value if not found
// //    */
// //   private async getCompanyID(): Promise<string> {
// //     try {
// //       const storedCompanyID = await AsyncStorage.getItem('company_id');
// //       if (storedCompanyID) {
// //         return storedCompanyID;
// //       }
// //       // Use config company ID
// //       return MARG_ERP_CONFIG.CompanyID || MARG_ERP_CONFIG.DefaultCompanyID;
// //     } catch (error) {
// //       console.error('Error getting company ID:', error);
// //       return MARG_ERP_CONFIG.DefaultCompanyID;
// //     }
// //   }

// //   /**
// //    * Fetch banners from MargERP API
// //    */
// //   async getBanners(): Promise<ApiResponse<MargBanner[]>> {
// //     console.log('🖼️ Fetching banners from MargERP API');

// //     try {
// //       // Send request with correct parameters from backend
// //       const requestBody: MargBannerRequest = {
// //         date: '',
// //         DType: 'PAASKIDUKAAN',      // Store type
// //         Adtype: 'BANNER',            // Ad type
// //         ImageYN: '',
// //         CompanyID: '',
// //         IMEI: '',
// //       };

// //       console.log('📤 MargERP Banner Request (DType: PAASKIDUKAAN, Adtype: BANNER)');

// //       const response = await axios.post<MargBannerResponse>(
// //         `${this.baseURL}${this.endpoint}`,
// //         requestBody,
// //         {
// //           timeout: 15000,
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'Accept': 'application/json',
// //           },
// //         }
// //       );

// //       console.log('📥 MargERP Banner Response Status:', response.data.Status);
// //       console.log('📥 Data field:', response.data.Data ? `Present (length: ${String(response.data.Data).length})` : 'NULL');
// //       console.log('📥 CompData field:', response.data.CompData ? `Present (length: ${response.data.CompData.length})` : 'NULL');
// //       console.log('📥 Full Response Keys:', Object.keys(response.data));

// //       // Check if the API call was successful
// //       if (response.data.Status === 'Success' || response.data.Status === 'success') {
// //         // Try Data first, if null/empty try CompData
// //         let bannerData = response.data.Data;
        
// //         if (!bannerData && response.data.CompData) {
// //           console.log('📊 Data is null/empty, using CompData instead');
// //           bannerData = response.data.CompData;
// //         }
        
// //         // Check if we have actual data
// //         if (!bannerData || (typeof bannerData === 'string' && bannerData.trim() === '')) {
// //           console.warn('⚠️ API returned Success but no banner data in Data or CompData');
// //           return {
// //             success: false,
// //             data: [],
// //             error: 'No banner data returned from API',
// //           };
// //         }
        
// //         if (bannerData) {
// //           console.log('🔄 Calling parseMargBanners with data type:', typeof bannerData, 'Length:', String(bannerData).length);
// //           const banners = await this.parseMargBanners(bannerData);
// //           console.log('✅ Successfully parsed banners:', banners.length);
// //           return {
// //             success: true,
// //             data: banners,
// //           };
// //         } else {
// //           console.warn('⚠️ MargERP API returned Success but no Data or CompData');
// //           return {
// //             success: false,
// //             data: [],
// //             error: 'No banner data in response',
// //           };
// //         }
// //       } else {
// //         const errorMsg = response.data.ErrorMessage || 'Failed to fetch banners';
// //         console.warn(
// //           '⚠️ MargERP API returned status:',
// //           response.data.Status,
// //           errorMsg
// //         );
// //         return {
// //           success: false,
// //           data: [],
// //           error: errorMsg,
// //         };
// //       }
// //     } catch (error: any) {
// //       const errorMessage = error.message || 'Failed to fetch banners from MargERP';
// //       console.error('❌ Error fetching banners from MargERP:', errorMessage);
// //       return {
// //         success: false,
// //         data: [],
// //         error: errorMessage,
// //       };
// //     }
// //   }

// //   /**
// //    * Detect image type from Base64 header/magic bytes
// //    * Returns the file extension based on actual image format
// //    */
// //   private detectImageExtension(base64Data: string): string {
// //     const prefix = base64Data.substring(0, 20); // First 20 chars are usually enough
    
// //     console.log('🔍 Detecting image type from Base64 header...');
// //     console.log('   Prefix:', prefix);
    
// //     // PNG: starts with "iVBORw0KGgo" (hex: 89 50 4E 47...)
// //     if (base64Data.startsWith('iVBORw0KGgo')) {
// //       console.log('   ✅ Detected: PNG');
// //       return 'png';
// //     }
    
// //     // JPEG: starts with "/9j/" (hex: FF D8 FF...)
// //     if (base64Data.startsWith('/9j/')) {
// //       console.log('   ✅ Detected: JPEG');
// //       return 'jpg';
// //     }
    
// //     // WebP: starts with "UklGR" (hex: 52 49 46 46 57 45 42 50)
// //     if (base64Data.startsWith('UklGR')) {
// //       console.log('   ✅ Detected: WebP');
// //       return 'webp';
// //     }
    
// //     // GIF: starts with "R0lGODlh" (hex: 47 49 46 38)
// //     if (base64Data.startsWith('R0lGODlh')) {
// //       console.log('   ✅ Detected: GIF');
// //       return 'gif';
// //     }
    
// //     // BMP: starts with "Qk0" (hex: 42 4D)
// //     if (base64Data.startsWith('Qk0')) {
// //       console.log('   ✅ Detected: BMP');
// //       return 'bmp';
// //     }
    
// //     // If we can't detect, log the actual hex bytes for debugging
// //     console.warn('   ⚠️ Unknown image type, attempting to decode header...');
// //     try {
// //       const binaryStart = atob(prefix);
// //       const hexBytes = Array.from({ length: Math.min(8, binaryStart.length) })
// //         .map((_, i) => '0x' + binaryStart.charCodeAt(i).toString(16).padStart(2, '0'))
// //         .join(' ');
// //       console.warn('   Hex bytes:', hexBytes);
// //     } catch (e) {
// //       console.warn('   Could not decode header');
// //     }
    
// //     // Default to jpg as many ERP systems use JPEG
// //     console.warn('   🔄 Defaulting to JPEG');
// //     return 'jpg';
// //   }

// //   /**
// //    * Convert base64 image to file URI
// //    * Saves the base64 data to app's cache directory with correct extension
// //    */
// //   private async base64ToFileUri(base64Data: string): Promise<string> {
// //     try {
// //       // Detect actual image type
// //       const imageExt = this.detectImageExtension(base64Data);
// //       const fileName = `banner_${Date.now()}.${imageExt}`;
// //       // Use documentDirectory as fallback since cacheDirectory might not exist in some versions
// //       const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      
// //       if (!cacheDir) {
// //         throw new Error('No valid file system directory available');
// //       }
      
// //       const filePath = `${cacheDir}${fileName}`;
      
// //       console.log('💾 Saving base64 image to file:', filePath);
      
// //       // Clean base64 string - remove all whitespace and newlines
// //       const cleanedBase64 = base64Data.replace(/\s/g, '');
// //       console.log('   Original base64 length:', base64Data.length);
// //       console.log('   Cleaned base64 length:', cleanedBase64.length);
// //       console.log('   Image extension:', imageExt);
      
// //       // Validate base64 format
// //       if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedBase64)) {
// //         throw new Error('Invalid base64 format after cleaning');
// //       }
// //       console.log('   Base64 format validated ✓');
      
// //       // Write base64 data to file using legacy API
// //       await FileSystem.writeAsStringAsync(filePath, cleanedBase64, {
// //         encoding: FileSystem.EncodingType.Base64,
// //       });
      
// //       console.log('   Write operation completed');
      
// //       // Verify file exists
// //       const fileInfo = await FileSystem.getInfoAsync(filePath);
// //       console.log('📋 File info:', {
// //         exists: fileInfo.exists,
// //         // size: fileInfo.size,
// //         isDirectory: fileInfo.isDirectory,
// //       });
      
// //       if (!fileInfo.exists) {
// //         throw new Error(`File was not created at: ${filePath}`);
// //       }
      
// //       // Calculate expected size: base64 decoded is roughly 75% of original
// //       const expectedSize = Math.floor(cleanedBase64.length * 0.75);
// //       const actualSize = fileInfo.size || 0;
// //       const sizeMatch = Math.abs(actualSize - expectedSize) < 1000; // Allow 1KB variance
      
// //       console.log('✅ Successfully saved image to:', filePath);
// //       console.log('   Expected size:', expectedSize, 'bytes (approx)');
// //       console.log('   Actual size:', actualSize, 'bytes');
// //       console.log('   Size match:', sizeMatch);
      
// //       return filePath; // Return the file path directly
// //     } catch (error) {
// //       console.error('❌ Error saving base64 to file:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Try to decompress base64 data using zlib
// //    * Returns original if decompression fails (data is not compressed)
// //    */
// //   private tryDecompressBase64Data(base64Data: string): string {
// //     try {
// //       console.log('🔓 Attempting to decompress base64 data...');
// //       console.log('   Input length:', base64Data.length);
      
// //       // Decode base64 to binary string
// //       const binaryString = atob(base64Data);
      
// //       // Check for zlib magic number (0x78 is typical)
// //       const firstByte = binaryString.charCodeAt(0);
// //       console.log('   First byte (hex):', '0x' + firstByte.toString(16));
      
// //       if (firstByte !== 0x78) {
// //         console.log('⚠️ Not zlib compressed data (no 0x78 magic). Returning original.');
// //         return base64Data;
// //       }
      
// //       // Convert binary string to bytes
// //       const bytes = new Uint8Array(binaryString.length);
// //       for (let i = 0; i < binaryString.length; i++) {
// //         bytes[i] = binaryString.charCodeAt(i);
// //       }
      
// //       // Decompress using pako
// //       const decompressed = pako.inflate(bytes, { to: 'string' });
// //       console.log('✅ Successfully decompressed data to:', decompressed.length, 'bytes');
      
// //       return decompressed;
// //     } catch (error) {
// //       console.error('❌ Error decompressing data:', error);
// //       console.log('   Data is likely not compressed. Using original.');
// //       // Return original if decompression fails
// //       return base64Data;
// //     }
// //   }

// //   /**
// //    * Parse banner data from MargERP response
// //    * Handles: JSON strings, comma/pipe separated URLs, base64 encoded images
// //    */
// //   private async parseMargBanners(data: any): Promise<MargBanner[]> {
// //     try {
// //       console.log('📋 Raw banner data type:', typeof data);
// //       console.log('   Data length:', String(data).length);
      
// //       let bannerArray: any[] = [];
// //       let processedData = data;
      
// //       // If data is a string, try to decompress/parse it
// //       if (typeof data === 'string') {
// //         console.log('🔍 Detected string data, checking if compressed...');
        
// //         // Check if it looks like base64
// //         const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(data.trim());
// //         console.log('   Is Base64:', isBase64);
        
// //         if (isBase64 && data.length > 100) {
// //           console.log('   Attempting decompression...');
// //           // Try to decompress first
// //           const decompressed = this.tryDecompressBase64Data(data);
          
// //           // If decompression produced different data, use it
// //           if (decompressed !== data) {
// //             processedData = decompressed;
// //             console.log('📦 Using decompressed data');
// //           } else {
// //             processedData = data;
// //             console.log('ℹ️ Data is base64 image (not compressed). Using as-is.');
// //           }
// //         }
// //       }
      
// //       console.log('📊 Processing data after decompression check');
      
// //       // Now parse the processed data
// //       if (typeof processedData === 'string') {
// //         // Check if it's base64 image data
// //         const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(processedData.trim());
        
// //         if (isBase64 && processedData.length > 100) {
// //           console.log('🖼️ Base64 image data detected, saving to file...');
          
// //           try {
// //             // Convert base64 to file URI
// //             const fileUri = await this.base64ToFileUri(processedData);
// //             console.log('   File URI:', fileUri);
            
// //             bannerArray = [{
// //               id: 'banner_0',
// //               image: fileUri, // Use file:// URI instead of data URI
// //             }];
// //           } catch (error) {
// //             console.error('❌ Failed to convert base64 to file URI:', error);
// //             // Fallback: try data URI anyway
// //             const imageDataUri = `data:image/png;base64,${processedData}`;
// //             bannerArray = [{
// //               id: 'banner_0',
// //               image: imageDataUri,
// //             }];
// //           }
// //         } else {
// //           // Try to parse as JSON
// //           try {
// //             const parsed = JSON.parse(processedData);
// //             bannerArray = Array.isArray(parsed) ? parsed : [parsed];
// //             console.log('✅ Successfully parsed as JSON, array length:', bannerArray.length);
// //           } catch (e) {
// //             console.log('⚠️ Not JSON, treating as comma-separated or pipe-separated URLs');
// //             // Try comma or pipe separated URLs
// //             const urls = processedData.split(/[,|]/).map((url: string) => url.trim()).filter((url: string) => url.length > 0);
// //             console.log('   Found URLs:', urls.length);
// //             bannerArray = urls.map((url: string, idx: number) => ({
// //               image: url,
// //               id: `banner_${idx}`,
// //             }));
// //           }
// //         }
// //       } else if (Array.isArray(processedData)) {
// //         console.log('   Data is already an array, length:', processedData.length);
// //         bannerArray = processedData;
// //       } else if (typeof processedData === 'object' && processedData !== null) {
// //         console.log('   Data is an object, wrapping in array');
// //         bannerArray = [processedData];
// //       }
      
// //       console.log('📊 Banner array length before filtering:', bannerArray.length);

// //       const parsed = bannerArray
// //         .filter((item: any) => item && (item.image || item.ImageUrl || item.bannerImage || item.url || item.URL))
// //         .map((item: any, index: number) => {
// //           let imageUri = item.image || item.ImageUrl || item.bannerImage || item.url || item.URL || '';
          
// //           // For base64 data URIs, ensure proper format for React Native
// //           // If it's a file URI or http(s), leave as is
// //           if (imageUri.startsWith('file://') || imageUri.startsWith('http') || imageUri.startsWith('/')) {
// //             // Already in correct format
// //             console.log(`   Banner ${index + 1}: Using ${imageUri.startsWith('file://') ? 'file' : 'http'} URI`);
// //           } else if (imageUri.startsWith('data:image')) {
// //             // Data URI - will try to work but might fail on native
// //             console.log(`   Banner ${index + 1}: Using data URI (${imageUri.length} chars)`);
// //           } else if (/^[A-Za-z0-9+/]*={0,2}$/.test(imageUri.trim())) {
// //             // Raw base64 without URI prefix - add data URI
// //             imageUri = `data:image/png;base64,${imageUri}`;
// //             console.log(`   Banner ${index + 1}: Added PNG data URI prefix`);
// //           }
          
// //           return {
// //             id: item.id || item.ID || `banner_${index}`,
// //             image: imageUri,
// //             title: item.title || item.Title || item.bannerTitle || '',
// //             description: item.description || item.Description || item.bannerDescription || '',
// //           };
// //         })
// //         .filter((banner: MargBanner) => banner.image); // Only include banners with images
      
// //       console.log('✅ Successfully parsed banners count:', parsed.length);
// //       parsed.forEach((banner, idx) => {
// //         const preview = banner.image.startsWith('file://') 
// //           ? `[file URI]`
// //           : banner.image.startsWith('data:') 
// //           ? `[data URI, ${banner.image.length} chars]`
// //           : banner.image.substring(0, 60);
// //         console.log(`   Banner ${idx + 1}: ID=${banner.id}, Preview=${preview}...`);
// //       });
      
// //       return parsed;
// //     } catch (error) {
// //       console.error('❌ Error parsing MargERP banners:', error);
// //       console.error('   Error details:', (error as any).message);
// //       return [];
// //     }
// //   }

// //   /**
// //    * Set company ID (can be called during app initialization)
// //    */
// //   async setCompanyID(companyID: string): Promise<void> {
// //     try {
// //       await AsyncStorage.setItem('company_id', companyID);
// //       console.log('✅ Company ID saved:', companyID);
// //     } catch (error) {
// //       console.error('Error setting company ID:', error);
// //     }
// //   }

// //   /**
// //    * Set device IMEI (can be called if you have a way to get it)
// //    */
// //   async setDeviceIMEI(imei: string): Promise<void> {
// //     try {
// //       await AsyncStorage.setItem('device_imei', imei);
// //       console.log('✅ Device IMEI saved:', imei);
// //     } catch (error) {
// //       console.error('Error setting device IMEI:', error);
// //     }
// //   }
// // }

// // export const margBannerService = new MargBannerService();


// // services/api/margBannerService.ts
// import apiClient from './client';
// import { decryptAndDecompress } from '../../utils/margCrypto';

// // The secret key used by the C# backend
// const MARG_SECRET_KEY = '690QIDCX1WU1';

// export interface MargBanner {
//   id: string;
//   imageUrl: string;
//   title?: string;
//   description?: string;
//   storeType: 'grocery' | 'pharma';
//   isActive?: boolean;
// }

// interface MargBannerApiResponse {
//   Data?: string;  // Encrypted and compressed data
//   CompData?: string;  // Alternative field for compressed data
//   Status: string;
//   ErrorCode?: string;
//   ErrorMessage?: string;
// }

// class MargBannerService {
//   /**
//    * Fetch banners from MargERP API
//    * The API returns encrypted and compressed banner data
//    */
//   async getBanners(): Promise<MargBanner[]> {
//     try {
//       console.log('\n╔════════════════════════════════════════════════════════════╗');
//       console.log('║  🎬 STARTING BANNER FETCH PROCESS                        ║');
//       console.log('╚════════════════════════════════════════════════════════════╝\n');
//       console.log('📡 [STEP 1/7] Making API request to MargERP...');
//       console.log('   Endpoint: /marg/banners');
//       console.log('   Method: POST');

//       // Make API request
//       const response = await apiClient.post<MargBannerApiResponse>('/marg/banners', {
//         date: '',
//         DType: 'PAASKIDUKAAN',  // Store type
//         Adtype: 'BANNER',        // Ad type
//         ImageYN: '',
//         CompanyID: '',
//         IMEI: '',
//       });

//       console.log('\n✅ [STEP 1/7] API request completed');
//       console.log('📦 API Response received');
//       // console.log('   Status code:', response.status);
//       console.log('   Response keys:', response.data ? Object.keys(response.data) : 'NO DATA');

//       if (!response?.data) {
//         console.log('\n❌ [FAILURE] No data in API response');
//         console.log('   Response object:', response);
//         console.log('   🔍 WHY BANNERS NOT DISPLAYED: API returned no data object');
//         return [];
//       }

//       console.log('\n📊 [STEP 2/7] Checking API response status...');
//       console.log('   Status field value:', response.data.Status);

//       // Check for success status
//       if (response.data.Status !== 'Success' && response.data.Status !== 'success') {
//         console.error('\n❌ [FAILURE] API returned non-success status');
//         console.error('   Status:', response.data.Status);
//         console.error('   Error Code:', response.data.ErrorCode);
//         console.error('   Error Message:', response.data.ErrorMessage);
//         console.error('   🔍 WHY BANNERS NOT DISPLAYED: API returned error status');
//         return [];
//       }

//       console.log('✅ [STEP 2/7] API status is Success');

//       // Get the encrypted data (try Data field first, then CompData)
//       console.log('\n📦 [STEP 3/7] Extracting encrypted data from response...');
//       console.log('   Checking Data field:', response.data.Data ? `EXISTS (${response.data.Data.length} chars)` : 'NULL/EMPTY');
//       console.log('   Checking CompData field:', response.data.CompData ? `EXISTS (${response.data.CompData.length} chars)` : 'NULL/EMPTY');
      
//       const encryptedData = response.data.Data || response.data.CompData;

//       if (!encryptedData) {
//         console.log('\n❌ [FAILURE] No encrypted data in response');
//         console.log('   Both Data and CompData fields are empty/null');
//         console.log('   Available fields:', Object.keys(response.data));
//         console.log('   🔍 WHY BANNERS NOT DISPLAYED: No encrypted data in API response');
//         return [];
//       }

//       console.log('✅ [STEP 3/7] Encrypted data extracted');
//       console.log('   Data length:', encryptedData.length, 'characters');
//       console.log('   First 80 chars:', encryptedData.substring(0, 80) + '...');

//       // Step 1: Decrypt and decompress the data
//       console.log('\n🔐 [STEP 4/7] Decrypting and decompressing data...');
//       console.log('   Using key:', MARG_SECRET_KEY);
      
//       const decompressedJson = decryptAndDecompress(encryptedData, MARG_SECRET_KEY);
      
//       console.log('✅ [STEP 4/7] Data decrypted and decompressed successfully');
//       console.log('   Decompressed length:', decompressedJson.length, 'characters');
//       console.log('   First 200 chars:', decompressedJson.substring(0, 200) + '...');

//       // Step 2: Parse JSON
//       console.log('\n📋 [STEP 5/7] Parsing JSON data...');
//       const parsedData = JSON.parse(decompressedJson);
//       console.log('✅ [STEP 5/7] JSON parsed successfully');
//       console.log('   Data type:', typeof parsedData);
//       console.log('   Is array:', Array.isArray(parsedData));
//       if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
//         console.log('   Object keys:', Object.keys(parsedData));
//       }

//       // Step 3: Extract banners array
//       console.log('\n🔍 [STEP 6/7] Extracting banners array from parsed data...');
//       let bannersArray: any[] = [];
      
//       if (Array.isArray(parsedData)) {
//         console.log('   ✓ Data is already an array');
//         bannersArray = parsedData;
//       } else if (parsedData.banners && Array.isArray(parsedData.banners)) {
//         console.log('   ✓ Found banners array in parsedData.banners');
//         bannersArray = parsedData.banners;
//       } else if (parsedData.data && Array.isArray(parsedData.data)) {
//         console.log('   ✓ Found banners array in parsedData.data');
//         bannersArray = parsedData.data;
//       } else if (parsedData.Data && Array.isArray(parsedData.Data)) {
//         console.log('   ✓ Found banners array in parsedData.Data');
//         bannersArray = parsedData.Data;
//       } else {
//         console.log('\n❌ [FAILURE] Could not extract banners array');
//         console.log('   Parsed data structure:', JSON.stringify(parsedData, null, 2));
//         console.log('   🔍 WHY BANNERS NOT DISPLAYED: Unexpected data structure after parsing');
//         return [];
//       }

//       console.log('✅ [STEP 6/7] Banners array extracted');
//       console.log('   Raw banners count:', bannersArray.length);

//       // Step 4: Transform to our banner interface
//       console.log('\n🔄 [STEP 7/7] Transforming banners to app format...');
      
//       // Track filtering
//       let filteredOutCount = 0;
//       let processedCount = 0;
      
//       const banners: MargBanner[] = bannersArray
//         .filter((item: any, index: number) => {
//           const hasImage = item && (item.imageUrl || item.ImageUrl || item.image || item.Image);
          
//           if (!hasImage) {
//             filteredOutCount++;
//             console.log(`   ⚠️ Banner ${index} filtered out: NO IMAGE URL`);
//             console.log(`      Banner data:`, JSON.stringify(item, null, 2));
//           }
          
//           return hasImage;
//         })
//         .map((item: any, index: number) => {
//           processedCount++;
//           const imageUrl = item.imageUrl || item.ImageUrl || item.image || item.Image || '';
//           const storeType = this.determineStoreType(item);

//           const banner = {
//             id: item.id || item.Id || item.ID || `banner_${index}`,
//             imageUrl: imageUrl,
//             title: item.title || item.Title || '',
//             description: item.description || item.Description || '',
//             storeType: storeType,
//             isActive: item.isActive !== false, // Default to true if not specified
//           };

//           console.log(`   ✓ Banner ${processedCount} processed:`);
//           console.log(`      ID: ${banner.id}`);
//           console.log(`      Store Type: ${banner.storeType}`);
//           console.log(`      Active: ${banner.isActive}`);
//           console.log(`      Title: ${banner.title || '(no title)'}`);
//           console.log(`      Image URL: ${banner.imageUrl.substring(0, 80)}...`);

//           return banner;
//         });

//       console.log('\n✅ [STEP 7/7] Banner transformation completed');
//       console.log('   Total raw banners:', bannersArray.length);
//       console.log('   Filtered out (no image):', filteredOutCount);
//       console.log('   Successfully processed:', banners.length);

//       if (banners.length === 0) {
//         console.log('\n⚠️ [WARNING] No banners to display!');
//         console.log('   🔍 WHY BANNERS NOT DISPLAYED: All banners were filtered out (no image URLs)');
//         console.log('   Check your backend data to ensure imageUrl field exists');
//       } else {
//         console.log('\n╔════════════════════════════════════════════════════════════╗');
//         console.log('║  ✅ SUCCESS - Banners Ready for Display                  ║');
//         console.log('╚════════════════════════════════════════════════════════════╝');
//         console.log(`   ${banners.length} banner(s) ready to be filtered by store type`);
//       }

//       return banners;

//     } catch (error: any) {
//       console.log('\n╔════════════════════════════════════════════════════════════╗');
//       console.log('║  ❌ ERROR IN BANNER FETCH PROCESS                        ║');
//       console.log('╚════════════════════════════════════════════════════════════╝\n');
//       console.error('❌ Error fetching banners:', error);
//       console.error('   Error type:', error.name);
//       console.error('   Error message:', error.message);
//       console.error('   Stack trace:', error.stack);
      
//       if (error.response) {
//         console.error('\n📡 API Response Error:');
//         console.error('   Status:', error.response.status);
//         console.error('   Status Text:', error.response.statusText);
//         console.error('   Response Data:', error.response.data);
//         console.error('   🔍 WHY BANNERS NOT DISPLAYED: API request failed with status', error.response.status);
//       } else if (error.request) {
//         console.error('\n📡 Network Error:');
//         console.error('   No response received from server');
//         console.error('   Request:', error.request);
//         console.error('   🔍 WHY BANNERS NOT DISPLAYED: Network error - no response from server');
//       } else {
//         console.error('\n🔧 Processing Error:');
//         console.error('   Error occurred during data processing');
//         console.error('   🔍 WHY BANNERS NOT DISPLAYED:', error.message);
//       }
      
//       // Return empty array instead of throwing to prevent app crashes
//       return [];
//     }
//   }

//   /**
//    * Determine store type from banner data
//    */
//   private determineStoreType(item: any): 'grocery' | 'pharma' {
//     console.log('      🏪 Determining store type for banner...');
    
//     // Check explicit storeType field
//     if (item.storeType) {
//       const type = item.storeType.toLowerCase();
//       console.log(`         Found storeType field: "${item.storeType}"`);
      
//       if (type.includes('pharma') || type.includes('pharmacy')) {
//         console.log('         ✓ Determined as: pharma');
//         return 'pharma';
//       }
//       console.log('         ✓ Determined as: grocery');
//       return 'grocery';
//     }

//     // Check category or type fields
//     if (item.category || item.Category || item.type || item.Type) {
//       const category = (item.category || item.Category || item.type || item.Type).toLowerCase();
//       console.log(`         Found category/type field: "${category}"`);
      
//       if (category.includes('pharma') || category.includes('pharmacy') || category.includes('medicine')) {
//         console.log('         ✓ Determined as: pharma');
//         return 'pharma';
//       }
//       console.log('         ✓ Determined as: grocery');
//       return 'grocery';
//     }

//     // Default to grocery
//     console.log('         No storeType/category field found');
//     console.log('         ✓ Using default: grocery');
//     return 'grocery';
//   }

//   /**
//    * Get banner by ID (if needed for detail screen)
//    */
//   async getBannerById(bannerId: string): Promise<MargBanner | null> {
//     try {
//       const allBanners = await this.getBanners();
//       const banner = allBanners.find(b => b.id === bannerId);
//       return banner || null;
//     } catch (error) {
//       console.error('❌ Error fetching banner by ID:', error);
//       return null;
//     }
//   }
// }

// export const margBannerService = new MargBannerService();


// services/api/margBannerService.ts
import axios from 'axios';
import { decryptAndDecompress } from '../../utils/margCrypto';

// The secret key used by the C# backend
const MARG_SECRET_KEY = '690QIDCX1WU1';

export interface MargBanner {
  id: string;
  imageUrl: string;
  title?: string;
  description?: string;
  storeType: 'grocery' | 'pharma';
  isActive?: boolean;
}

interface MargBannerApiResponse {
  Data?: string;  // Encrypted and compressed data
  CompData?: string;  // Alternative field for compressed data
  Status: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

class MargBannerService {
  /**
   * Fetch banners from MargERP API
   * The API returns encrypted and compressed banner data
   */
  async getBanners(): Promise<MargBanner[]> {
    try {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  🎬 STARTING BANNER FETCH PROCESS                        ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.log('📡 [STEP 1/7] Making API request to MargERP...');
      console.log('   Endpoint: https://margerpexitapi.margcompusoft.com/api/MargERPExit/GetMargERPExit');
      console.log('   Method: POST');

      // Make API request directly to MargERP endpoint
      const response = await axios.post<MargBannerApiResponse>(
        'https://margerpexitapi.margcompusoft.com/api/MargERPExit/GetMargERPExit',
        {
          date: '',
          DType: 'PAASKIDUKAAN',  // Store type
          Adtype: 'BANNER',        // Ad type
          ImageYN: '',
          CompanyID: '',
          IMEI: '',
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('\n✅ [STEP 1/7] API request completed');
      console.log('📦 API Response received');
      console.log('   Status code:', response.status);
      console.log('   Response keys:', response.data ? Object.keys(response.data) : 'NO DATA');

      if (!response?.data) {
        console.log('\n❌ [FAILURE] No data in API response');
        console.log('   Response object:', response);
        console.log('   🔍 WHY BANNERS NOT DISPLAYED: API returned no data object');
        return [];
      }

      console.log('\n📊 [STEP 2/7] Checking API response status...');
      console.log('   Status field value:', response.data.Status);

      // Check for success status
      if (response.data.Status !== 'Success' && response.data.Status !== 'success') {
        console.error('\n❌ [FAILURE] API returned non-success status');
        console.error('   Status:', response.data.Status);
        console.error('   Error Code:', response.data.ErrorCode);
        console.error('   Error Message:', response.data.ErrorMessage);
        console.error('   🔍 WHY BANNERS NOT DISPLAYED: API returned error status');
        return [];
      }

      console.log('✅ [STEP 2/7] API status is Success');

      // Get the encrypted data (try Data field first, then CompData)
      console.log('\n📦 [STEP 3/7] Extracting encrypted data from response...');
      console.log('   Checking Data field:', response.data.Data ? `EXISTS (${response.data.Data.length} chars)` : 'NULL/EMPTY');
      console.log('   Checking CompData field:', response.data.CompData ? `EXISTS (${response.data.CompData.length} chars)` : 'NULL/EMPTY');
      
      const encryptedData = response.data.Data || response.data.CompData;

      if (!encryptedData) {
        console.log('\n❌ [FAILURE] No encrypted data in response');
        console.log('   Both Data and CompData fields are empty/null');
        console.log('   Available fields:', Object.keys(response.data));
        console.log('   🔍 WHY BANNERS NOT DISPLAYED: No encrypted data in API response');
        return [];
      }

      console.log('✅ [STEP 3/7] Encrypted data extracted');
      console.log('   Data length:', encryptedData.length, 'characters');
      console.log('   First 80 chars:', encryptedData.substring(0, 80) + '...');

      // Step 1: Decrypt and decompress the data
      console.log('\n🔐 [STEP 4/7] Decrypting and decompressing data...');
      console.log('   Using key:', MARG_SECRET_KEY);
      
      const decompressedJson = decryptAndDecompress(encryptedData, MARG_SECRET_KEY);
      
      console.log('✅ [STEP 4/7] Data decrypted and decompressed successfully');
      console.log('   Decompressed length:', decompressedJson.length, 'characters');
      console.log('   First 200 chars:', decompressedJson.substring(0, 200) + '...');

      // Step 2: Parse JSON
      console.log('\n📋 [STEP 5/7] Parsing JSON data...');
      const parsedData = JSON.parse(decompressedJson);
      console.log('✅ [STEP 5/7] JSON parsed successfully');
      console.log('   Data type:', typeof parsedData);
      console.log('   Is array:', Array.isArray(parsedData));
      if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
        console.log('   Object keys:', Object.keys(parsedData));
      }

      // Step 3: Extract banners array
      console.log('\n🔍 [STEP 6/7] Extracting banners array from parsed data...');
      let bannersArray: any[] = [];
      
      if (Array.isArray(parsedData)) {
        console.log('   ✓ Data is already an array');
        bannersArray = parsedData;
      } else if (parsedData.banners && Array.isArray(parsedData.banners)) {
        console.log('   ✓ Found banners array in parsedData.banners');
        bannersArray = parsedData.banners;
      } else if (parsedData.data && Array.isArray(parsedData.data)) {
        console.log('   ✓ Found banners array in parsedData.data');
        bannersArray = parsedData.data;
      } else if (parsedData.Data && Array.isArray(parsedData.Data)) {
        console.log('   ✓ Found banners array in parsedData.Data');
        bannersArray = parsedData.Data;
      } else {
        console.log('\n❌ [FAILURE] Could not extract banners array');
        console.log('   Parsed data structure:', JSON.stringify(parsedData, null, 2));
        console.log('   🔍 WHY BANNERS NOT DISPLAYED: Unexpected data structure after parsing');
        return [];
      }

      console.log('✅ [STEP 6/7] Banners array extracted');
      console.log('   Raw banners count:', bannersArray.length);

      // Step 4: Transform to our banner interface
      console.log('\n🔄 [STEP 7/7] Transforming banners to app format...');
      
      // Track filtering
      let filteredOutCount = 0;
      let processedCount = 0;
      
      const banners: MargBanner[] = bannersArray
        .filter((item: any, index: number) => {
          const hasImage = item && (item.imageUrl || item.ImageUrl || item.image || item.Image);
          
          if (!hasImage) {
            filteredOutCount++;
            console.log(`   ⚠️ Banner ${index} filtered out: NO IMAGE URL`);
            console.log(`      Banner data:`, JSON.stringify(item, null, 2));
          }
          
          return hasImage;
        })
        .map((item: any, index: number) => {
          processedCount++;
          const imageUrl = item.imageUrl || item.ImageUrl || item.image || item.Image || '';
          const storeType = this.determineStoreType(item);

          const banner = {
            id: item.id || item.Id || item.ID || `banner_${index}`,
            imageUrl: imageUrl,
            title: item.title || item.Title || '',
            description: item.description || item.Description || '',
            storeType: storeType,
            isActive: item.isActive !== false, // Default to true if not specified
          };

          console.log(`   ✓ Banner ${processedCount} processed:`);
          console.log(`      ID: ${banner.id}`);
          console.log(`      Store Type: ${banner.storeType}`);
          console.log(`      Active: ${banner.isActive}`);
          console.log(`      Title: ${banner.title || '(no title)'}`);
          console.log(`      Image URL: ${banner.imageUrl.substring(0, 80)}...`);

          return banner;
        });

      console.log('\n✅ [STEP 7/7] Banner transformation completed');
      console.log('   Total raw banners:', bannersArray.length);
      console.log('   Filtered out (no image):', filteredOutCount);
      console.log('   Successfully processed:', banners.length);

      if (banners.length === 0) {
        console.log('\n⚠️ [WARNING] No banners to display!');
        console.log('   🔍 WHY BANNERS NOT DISPLAYED: All banners were filtered out (no image URLs)');
        console.log('   Check your backend data to ensure imageUrl field exists');
      } else {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ SUCCESS - Banners Ready for Display                  ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log(`   ${banners.length} banner(s) ready to be filtered by store type`);
      }

      return banners;

    } catch (error: any) {
      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║  ❌ ERROR IN BANNER FETCH PROCESS                        ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      console.error('❌ Error fetching banners:', error);
      console.error('   Error type:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
      
      if (error.response) {
        console.error('\n📡 API Response Error:');
        console.error('   Status:', error.response.status);
        console.error('   Status Text:', error.response.statusText);
        console.error('   Response Data:', error.response.data);
        console.error('   🔍 WHY BANNERS NOT DISPLAYED: API request failed with status', error.response.status);
      } else if (error.request) {
        console.error('\n📡 Network Error:');
        console.error('   No response received from server');
        console.error('   Request:', error.request);
        console.error('   🔍 WHY BANNERS NOT DISPLAYED: Network error - no response from server');
      } else {
        console.error('\n🔧 Processing Error:');
        console.error('   Error occurred during data processing');
        console.error('   🔍 WHY BANNERS NOT DISPLAYED:', error.message);
      }
      
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }

  /**
   * Determine store type from banner data
   */
  private determineStoreType(item: any): 'grocery' | 'pharma' {
    console.log('      🏪 Determining store type for banner...');
    
    // Check explicit storeType field
    if (item.storeType) {
      const type = item.storeType.toLowerCase();
      console.log(`         Found storeType field: "${item.storeType}"`);
      
      if (type.includes('pharma') || type.includes('pharmacy')) {
        console.log('         ✓ Determined as: pharma');
        return 'pharma';
      }
      console.log('         ✓ Determined as: grocery');
      return 'grocery';
    }

    // Check category or type fields
    if (item.category || item.Category || item.type || item.Type) {
      const category = (item.category || item.Category || item.type || item.Type).toLowerCase();
      console.log(`         Found category/type field: "${category}"`);
      
      if (category.includes('pharma') || category.includes('pharmacy') || category.includes('medicine')) {
        console.log('         ✓ Determined as: pharma');
        return 'pharma';
      }
      console.log('         ✓ Determined as: grocery');
      return 'grocery';
    }

    // Default to grocery
    console.log('         No storeType/category field found');
    console.log('         ✓ Using default: grocery');
    return 'grocery';
  }

  /**
   * Get banner by ID (if needed for detail screen)
   */
  async getBannerById(bannerId: string): Promise<MargBanner | null> {
    try {
      const allBanners = await this.getBanners();
      const banner = allBanners.find(b => b.id === bannerId);
      return banner || null;
    } catch (error) {
      console.error('❌ Error fetching banner by ID:', error);
      return null;
    }
  }
}

export const margBannerService = new MargBannerService();