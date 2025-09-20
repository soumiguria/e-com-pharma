# 🧪 Deep Linking Testing Guide

## 📱 **Complete Testing Process**

### **Step 1: Setup**
```bash
# Start the app
npx expo start

# Check Metro console for setup logs
# Should see:
# 🔗 NavigationContainer: Initial URL: null
# 🔗 NavigationContainer: Deep link received: [URL]
```

### **Step 2: Test Custom Scheme URLs**

#### **Android Testing:**
```bash
# Test basic store deep link
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.yourcompany.ecommexpo

# Test with real store ID
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/c4defa9f-0bf2-4226-a4b9-6b578e737714" com.yourcompany.ecommexpo

# Test with store type parameter
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123?type=grocery&name=My%20Store" com.yourcompany.ecommexpo
```

#### **iOS Testing:**
```bash
# Test basic store deep link
xcrun simctl openurl booted "ecomm://store/test123"

# Test with real store ID
xcrun simctl openurl booted "ecomm://store/c4defa9f-0bf2-4226-a4b9-6b578e737714"
```

### **Step 3: Test HTTPS URLs**

#### **Android Testing:**
```bash
# Test stores.yourdomain.com
adb shell am start -W -a android.intent.action.VIEW -d "https://stores.yourdomain.com/store/test123" com.yourcompany.ecommexpo

# Test qr.ecomm.com (shortened)
adb shell am start -W -a android.intent.action.VIEW -d "https://qr.ecomm.com/s/test123" com.yourcompany.ecommexpo

# Test ecomm-stores.com
adb shell am start -W -a android.intent.action.VIEW -d "https://ecomm-stores.com/store/test123" com.yourcompany.ecommexpo
```

#### **iOS Testing:**
```bash
# Test HTTPS URLs
xcrun simctl openurl booted "https://stores.yourdomain.com/store/test123"
xcrun simctl openurl booted "https://qr.ecomm.com/s/test123"
```

### **Step 4: Test Real Device Scenarios**

#### **QR Code Testing:**
1. **Generate QR Code:**
   - Use any QR code generator
   - URL: `https://qr.ecomm.com/s/test123`
   - Scan with phone camera

2. **Expected Behavior:**
   - App opens directly to store page
   - Store details loaded from backend

#### **Browser Testing:**
1. **Open URL in Browser:**
   - `https://stores.yourdomain.com/store/test123`
   - Should prompt to open in app

2. **Expected Behavior:**
   - Browser asks to open in app
   - App opens to store page

### **Step 5: Test App States**

#### **App Closed:**
```bash
# Force close app
adb shell am force-stop com.yourcompany.ecommexpo

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.yourcompany.ecommexpo
```

#### **App in Background:**
```bash
# App running in background
# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.yourcompany.ecommexpo
```

#### **App Running:**
```bash
# App already running
# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.yourcompany.ecommexpo
```

### **Step 6: Expected Console Logs**

#### **Successful Deep Link:**
```
🔗 NavigationContainer: Deep link received: ecomm://store/test123
🔗 NavigationContainer: Initial URL: ecomm://store/test123
🏪 StoreDeepLinkHandler: Processing store ID: test123
🔍 Fetching store details for ID: test123
 Store details fetched: {store data}
```

#### **Store Not Found:**
```
🔗 NavigationContainer: Deep link received: ecomm://store/invalid-id
🏪 StoreDeepLinkHandler: Processing store ID: invalid-id
🔍 Fetching store details for ID: invalid-id
  Store not found or error fetching store details
```

#### **Network Error:**
```
🔗 NavigationContainer: Deep link received: ecomm://store/test123
🏪 StoreDeepLinkHandler: Processing store ID: test123
🔍 Fetching store details for ID: test123
  Error handling store deep link: [error details]
```

### **Step 7: Test Different URL Formats**

#### **Valid URLs:**
```bash
# Custom scheme
ecomm://store/abc123
ecomm://store/abc123?type=grocery
ecomm://store/abc123?type=pharma&name=My%20Store

# HTTPS URLs
https://stores.yourdomain.com/store/abc123
https://qr.ecomm.com/s/abc123
https://ecomm-stores.com/store/abc123

# With parameters
https://stores.yourdomain.com/store/abc123?type=grocery&name=My%20Store
```

#### **Invalid URLs (Should Show Error):**
```bash
# Wrong scheme
https://google.com/store/abc123
http://stores.yourdomain.com/store/abc123

# Wrong path
ecomm://invalid/abc123
https://stores.yourdomain.com/invalid/abc123
```

### **Step 8: Test Error Scenarios**

#### **Invalid Store ID:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/invalid-store-id" com.yourcompany.ecommexpo
```
**Expected:** "Store Not Found" alert with "Browse Stores" option

#### **Network Error:**
- Turn off internet
- Test deep link
**Expected:** "Error" alert with "Browse Stores" option

#### **Malformed URL:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://invalid" com.yourcompany.ecommexpo
```
**Expected:** App opens normally (no deep link processing)

### **Step 9: Debug Commands**

#### **Check App Status:**
```bash
# Check if app is running
adb shell ps | grep com.yourcompany.ecommexpo

# Check app info
adb shell dumpsys package com.yourcompany.ecommexpo
```

#### **Check Deep Link Configuration:**
```bash
# Check intent filters
adb shell dumpsys package com.yourcompany.ecommexpo | grep -A 10 "intent-filter"
```

#### **Force Stop and Test:**
```bash
# Force stop app
adb shell am force-stop com.yourcompany.ecommexpo

# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test123" com.yourcompany.ecommexpo
```

### **Step 10: Success Criteria**

#### ** Deep Link Working:**
1. App opens to correct store page
2. Store details loaded from backend
3. "Store Found!" alert shown
4. Console logs show successful processing

#### ** Error Handling:**
1. Invalid store shows "Store Not Found" alert
2. Network error shows "Error" alert
3. Both have "Browse Stores" fallback option

#### ** App Store Fallback:**
1. When app not installed, web page opens
2. Download buttons for Play Store/App Store
3. Store information displayed

### **Step 11: Troubleshooting**

#### **Deep Link Not Working:**
1. Check Metro console for logs
2. Verify app.json configuration
3. Check intent filters in app.json
4. Test with different URL formats

#### **Store Not Loading:**
1. Check network connection
2. Verify store ID exists in backend
3. Check store service API
4. Verify authentication tokens

#### **Navigation Issues:**
1. Check NavigationContainer linking config
2. Verify screen names in types.ts
3. Check route parameters
4. Test with different navigation methods

### **Step 12: Performance Testing**

#### **Multiple Deep Links:**
```bash
# Test rapid deep link calls
for i in {1..5}; do
  adb shell am start -W -a android.intent.action.VIEW -d "ecomm://store/test$i" com.yourcompany.ecommexpo
  sleep 2
done
```

#### **Memory Usage:**
- Monitor app memory during deep link processing
- Check for memory leaks
- Verify proper cleanup

## 🎯 **Quick Test Checklist**

- [ ] Custom scheme URLs work
- [ ] HTTPS URLs work
- [ ] QR code scanning works
- [ ] Browser links work
- [ ] App closed scenario works
- [ ] App background scenario works
- [ ] App running scenario works
- [ ] Invalid store ID shows error
- [ ] Network error shows error
- [ ] Console logs show processing
- [ ] Store details load correctly
- [ ] Navigation works properly
- [ ] Error handling works
- [ ] App store fallback works

## 🚀 **Ready to Test!**

Follow these steps in order and check each scenario. The deep linking system should handle all cases gracefully!
