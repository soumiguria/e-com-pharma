// config/margBannerConfig.ts
// MargERP Banner Configuration Helper
// This file helps manage the MargERP banner API configuration

import { margBannerService } from '../services/api/margBannerService';
import { setMargERPCompanyID } from './appConfig';

/**
 * Initialize MargERP Banner Service
 * Call this in your App.tsx useEffect during app startup
 */
export const initializeMargBannerService = async (companyID?: string) => {
  try {
    console.log('🔧 Initializing MargERP Banner Service');
    
    if (companyID) {
      // Set custom company ID if provided
      await margBannerService.setCompanyID(companyID);
      setMargERPCompanyID(companyID);
      console.log('✅ MargERP Company ID set to:', companyID);
    } else {
      console.log('ℹ️ Using default MargERP Company ID from config');
    }
    
    // Optionally fetch banners during initialization to test connection
    console.log('ℹ️ Banner service ready for use');
    return true;
  } catch (error) {
    console.error('❌ Error initializing MargERP Banner Service:', error);
    return false;
  }
};

/**
 * Example usage in App.tsx:
 * 
 * useEffect(() => {
 *   initializeMargBannerService('YOUR_COMPANY_ID');
 * }, []);
 */

/**
 * Update Company ID at runtime
 */
export const updateMargCompanyID = async (companyID: string) => {
  try {
    await margBannerService.setCompanyID(companyID);
    setMargERPCompanyID(companyID);
    console.log('✅ Company ID updated:', companyID);
  } catch (error) {
    console.error('❌ Error updating company ID:', error);
  }
};

/**
 * Manual banner fetch for testing
 */
export const testMargBannerAPI = async () => {
  try {
    console.log('🧪 Testing MargERP Banner API...');
    const response = await margBannerService.getBanners();
    
    if (response.success) {
      console.log('✅ Test successful! Banners fetched:', response.data?.length);
      return response.data;
    } else {
      console.warn('⚠️ Test failed:', response.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return null;
  }
};
