# Voice Recognition - Expo Dev Client Setup Guide

This guide will help you set up voice recognition using `@react-native-voice/voice` in an Expo Dev Client environment.

## ⚠️ Important: Expo Go is NOT Supported

Voice recognition requires native modules that are **NOT available in Expo Go**. You **MUST** use Expo Dev Client (development build).

---

## Step 1: Prebuild Native Code

Run the prebuild command to generate native Android and iOS folders:

```bash
npx expo prebuild --clean
```

This will:
- Create/regenerate `android/` and `ios/` folders
- Configure native modules including `@react-native-voice/voice`
- Set up auto-linking for all native dependencies

**Verify:**
- ✅ `android/` folder exists
- ✅ `ios/` folder exists (if building for iOS)
- ✅ `android/app/src/main/AndroidManifest.xml` contains `RECORD_AUDIO` permission

---

## Step 2: Verify Android Configuration

### AndroidManifest.xml

The `RECORD_AUDIO` permission should already be present in:
```
android/app/src/main/AndroidManifest.xml
```

**Current permission (line 10):**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

✅ **Already configured!**

### build.gradle

Verify `minSdkVersion` is at least 24 (required for voice recognition):

**File:** `android/app/build.gradle`

The `minSdkVersion` is set via `expo-build-properties` in `app.json`:
- ✅ `minSdkVersion: 24` (configured in app.json)

**Auto-linking:**
- ✅ Auto-linking is enabled via `autolinkLibrariesWithApp()` in `android/app/build.gradle` (line 63)

---

## Step 3: Build Development Client

### Option A: Using Android Studio (Recommended)

1. **Open Android Studio**
   ```bash
   # Navigate to android folder
   cd android
   # Open in Android Studio
   # Or use: start android
   ```

2. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Select your device/emulator from the device dropdown
   - Click **Run** (green play button) or press `Shift + F10`
   - Wait for the build to complete (first build may take 5-10 minutes)

3. **Install on Device:**
   - The app will automatically install on your connected device/emulator
   - Make sure USB debugging is enabled on your physical device

### Option B: Using Command Line

```bash
# From project root
npx expo run:android
```

This will:
- Build the native Android app
- Install it on your connected device/emulator
- Start Metro bundler automatically

**Note:** First build may take 5-10 minutes. Subsequent builds are faster.

---

## Step 4: Start Metro with Dev Client

After the app is installed, start Metro bundler with Dev Client mode:

```bash
npx expo start --dev-client
```

**Important:** Use `--dev-client` flag, NOT regular `expo start`!

This ensures:
- ✅ Dev Client mode is enabled
- ✅ Native modules are properly loaded
- ✅ Hot reload works with native code

**Alternative script:**
```bash
npm run start:dev
```

---

## Step 5: Verify Voice Module

Once the app is running, test voice recognition:

1. **Open the app** on your device
2. **Navigate to Search Screen**
3. **Tap the microphone button** in the search bar
4. **Check console logs** for:
   ```
   ✅ Voice recognition ready
   🎤 Voice recognition available: true
   ```

### Expected Console Output (Success):

```
🎤 Voice module found, setting up...
✅ Listeners setup complete
✅ Voice recognition ready
🎤 Starting voice recognition...
✅ Voice recognition started
```

### If You See Errors:

If you still see errors like:
- `Cannot read property 'isSpeechAvailable' of null`
- `Cannot set property 'onSpeechStart' of null`

**Solutions:**
1. **Rebuild the app:**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

2. **Clear Metro cache:**
   ```bash
   npx expo start --dev-client --clear
   ```

3. **Clean Android build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

4. **Verify module is linked:**
   - Check `android/app/build.gradle` has `autolinkLibrariesWithApp()`
   - Check `android/settings.gradle` has Expo autolinking configured

---

## Step 6: Testing Voice Recognition

### Test Checklist:

1. ✅ **Permission Request:**
   - Tap mic button
   - Should see "Microphone Permission" dialog
   - Grant permission

2. ✅ **Voice Recognition:**
   - After granting permission, mic should start listening
   - Speak into microphone
   - Text should appear in search bar

3. ✅ **Error Handling:**
   - If module is null, you'll see a clear error message
   - App won't crash

### Debug Commands:

```bash
# Check if Voice module is available
# Add this to your code temporarily:
console.log('Voice module:', require('@react-native-voice/voice'));

# Should output an object, not null
```

---

## Troubleshooting

### Issue: Voice module is still null

**Solution:**
1. Ensure you're using Dev Client, not Expo Go
2. Rebuild the app completely:
   ```bash
   npx expo prebuild --clean
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

### Issue: Permission denied

**Solution:**
1. Go to Android Settings → Apps → Your App → Permissions
2. Enable Microphone permission manually
3. Restart the app

### Issue: Build fails

**Solution:**
1. Check Android Studio for specific errors
2. Ensure Java/Kotlin versions are compatible
3. Try:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew --stop
   cd ..
   npx expo prebuild --clean
   ```

### Issue: Metro bundler errors

**Solution:**
```bash
# Clear all caches
npx expo start --dev-client --clear
# Or
watchman watch-del-all
rm -rf node_modules
npm install
```

---

## Verification Checklist

Before considering setup complete, verify:

- [ ] `expo-dev-client` is in `app.json` plugins
- [ ] `android/` folder exists after prebuild
- [ ] `AndroidManifest.xml` has `RECORD_AUDIO` permission
- [ ] App is built with Dev Client (not Expo Go)
- [ ] Metro is running with `--dev-client` flag
- [ ] `Voice.isAvailable()` returns `true` (check console)
- [ ] Mic button is enabled and clickable
- [ ] Permission dialog appears when tapping mic
- [ ] Voice recognition starts after granting permission

---

## Quick Reference Commands

```bash
# 1. Prebuild native code
npx expo prebuild --clean

# 2. Build and install Dev Client
npx expo run:android

# 3. Start Metro with Dev Client
npx expo start --dev-client

# 4. Clean rebuild (if issues)
cd android && ./gradlew clean && cd .. && npx expo prebuild --clean && npx expo run:android
```

---

## Next Steps

After successful setup:

1. **Test voice recognition** in the search bar
2. **Verify transcript** appears correctly
3. **Test error handling** (deny permission, etc.)
4. **Remove debug logs** if needed

---

## Important Notes

- ⚠️ **Never use Expo Go** - Voice module requires native build
- ✅ **Always use `--dev-client`** flag when starting Metro
- ✅ **Rebuild after adding new native modules**
- ✅ **Test on physical device** for best results (emulator may have mic issues)

---

## Support

If you continue to experience issues:

1. Check Expo Dev Client documentation: https://docs.expo.dev/development/introduction/
2. Check `@react-native-voice/voice` documentation: https://github.com/react-native-voice/voice
3. Verify all dependencies are installed: `npm install`
4. Check Android Studio build logs for native errors

