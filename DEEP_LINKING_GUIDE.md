# Deep Linking Guide for E-Comm App

## Overview
This guide explains how to implement and use deep linking for store-specific QR codes and URLs in the E-Comm app.

## Features Implemented

###  Core Deep Linking
- **Custom Scheme**: `ecomm://store/{storeId}`
- **HTTPS URLs**: `https://stores.yourdomain.com/store/{storeId}`
- **QR Code URLs**: `https://qr.ecomm.com/s/{storeId}` (shortened)
- **App Store Fallback**: Automatic redirect to Play Store/App Store when app not installed

###  URL Formats Supported
```
Custom Scheme:
ecomm://store/abc123

HTTPS URLs:
https://stores.yourdomain.com/store/abc123
https://ecomm-stores.com/store/abc123
https://qr.ecomm.com/s/abc123

With Parameters:
https://stores.yourdomain.com/store/abc123?type=grocery&name=My%20Store
```

## How It Works

### 1. QR Code Scan/URL Click
When a user scans a QR code or clicks a store link:

**If App is Installed:**
- App opens directly to the specific store page
- Skips pincode and store list screens
- Shows store details and products

**If App is NOT Installed:**
- Opens web page with store information
- Shows download buttons for Play Store/App Store
- Provides fallback to browse stores online

### 2. Deep Link Flow
```
QR Code/URL → Deep Link Handler → Store Service → Store Detail Page
     ↓
App Not Installed → Web Page → App Store Redirect
```

## Implementation Details

### Files Created/Modified

#### 1. Core Services
- `services/deepLinkingService.ts` - Main deep linking logic
- `components/deepLink/DeepLinkHandler.tsx` - React component for handling deep links
- `utils/storeDeepLinkGenerator.ts` - Utilities for generating QR codes and deep links

#### 2. Configuration
- `app.json` - Updated with deep link intent filters
- `App.tsx` - Added DeepLinkHandler wrapper

#### 3. Web Fallback
- `public/store-redirect.html` - Web page for app store fallback

#### 4. UI Components
- `components/store/StoreQRCode.tsx` - QR code display component

### Deep Link Handler Logic
```typescript
// Parse incoming URL
const deepLinkResult = deepLinkingService.parseDeepLink(url);

if (deepLinkResult.type === 'store') {
  // Fetch store details
  const store = await storeService.getStoreById(storeId);
  
  // Navigate directly to store
  navigation.reset({
    index: 0,
    routes: [
      { name: 'Home' },
      { name: 'StoreDetail', params: { store, fromDeepLink: true } }
    ]
  });
}
```

## Usage Examples

### 1. Generate Store QR Code
```typescript
import { generateStoreQRCode } from '../utils/storeDeepLinkGenerator';

const qrData = generateStoreQRCode('store123', {
  storeName: 'My Grocery Store',
  storeType: 'grocery'
});

console.log('QR Code URL:', qrData.qrCodeUrl);
console.log('Deep Link:', qrData.deepLinkUrl);
```

### 2. Generate Deep Links
```typescript
import deepLinkingService from '../services/deepLinkingService';

const deepLinks = deepLinkingService.generateStoreDeepLink('store123', 'grocery', 'My Store');

console.log('Custom Scheme:', deepLinks.customScheme);
console.log('HTTPS URL:', deepLinks.httpsUrl);
console.log('QR URL:', deepLinks.qrUrl);
```

### 3. Display QR Code Component
```typescript
import StoreQRCode from '../components/store/StoreQRCode';

<StoreQRCode
  storeId="store123"
  storeName="My Grocery Store"
  storeType="grocery"
  showDetails={true}
/>
```

## URL Structure

### Custom Scheme Format
```
ecomm://store/{storeId}
```

### HTTPS URL Format
```
https://stores.yourdomain.com/store/{storeId}?type={storeType}&name={storeName}
```

### QR Code URL Format (Shortened)
```
https://qr.ecomm.com/s/{storeId}?type={storeType}&name={storeName}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `storeId` | string | Yes | Unique store identifier |
| `type` | string | No | Store type: `grocery` or `pharma` |
| `name` | string | No | Store name for display |

## Testing

### 1. Test Deep Links
```bash
# Android
adb shell am start \
  -W -a android.intent.action.VIEW \
  -d "ecomm://store/test123" \
  com.yourcompany.ecommexpo

# iOS Simulator
xcrun simctl openurl booted "ecomm://store/test123"
```

### 2. Test HTTPS URLs
```
https://stores.yourdomain.com/store/test123?type=grocery&name=Test%20Store
```

### 3. Test QR Codes
Generate QR codes using the utility functions and scan with device camera.

## App Store Integration

### Play Store URL
```
https://play.google.com/store/apps/details?id=com.yourcompany.ecommexpo
```

### App Store URL
```
https://apps.apple.com/app/e-comm-expo/id1234567890
```

## Web Fallback Page

The web fallback page (`public/store-redirect.html`) includes:
- Store information display
- Download buttons for both app stores
- Automatic app launch attempt
- Fallback to app store if app not installed

## Security Considerations

1. **URL Validation**: All deep link URLs are validated before processing
2. **Store ID Validation**: Store IDs are validated against backend database
3. **Error Handling**: Graceful fallbacks for invalid or missing stores
4. **Rate Limiting**: Consider implementing rate limiting for deep link requests

## Deployment Checklist

- [ ] Update `app.json` with correct bundle IDs and domains
- [ ] Configure web server to serve the fallback HTML page
- [ ] Test deep links on both Android and iOS
- [ ] Verify app store URLs are correct
- [ ] Test QR code generation and scanning
- [ ] Validate all URL formats work correctly

## Troubleshooting

### Common Issues

1. **Deep Link Not Working**
   - Check if URL scheme is correctly configured in `app.json`
   - Verify intent filters are properly set up
   - Test with different URL formats

2. **Store Not Found**
   - Ensure store ID exists in backend database
   - Check store service API endpoints
   - Verify authentication tokens

3. **App Store Redirect Not Working**
   - Update app store URLs in `deepLinkingService.ts`
   - Test web fallback page functionality
   - Verify domain configuration

### Debug Logging
Enable debug logging by checking console output for:
- `🔗 Parsing deep link:`
- `🔗 Deep link result:`
- `🏪 Processing store deep link:`

## Future Enhancements

1. **Analytics**: Track deep link usage and conversion rates
2. **A/B Testing**: Test different URL formats and landing pages
3. **Personalization**: Customize deep links based on user preferences
4. **Social Sharing**: Enhanced sharing capabilities with rich previews
5. **Campaign Tracking**: Track marketing campaigns through deep links
