# Fresh EAS Build Guide

This guide will help you clean everything and build a fresh EAS build.

---

## Quick Cleanup (Windows)

Run the cleanup script:

```bash
clean-build.bat
```

---

## Quick Cleanup (Mac/Linux)

Run the cleanup script:

```bash
chmod +x clean-build.sh
./clean-build.sh
```

---

## Manual Cleanup Steps

If you prefer to do it manually:

### 1. Remove Prebuild Folders

```bash
# Windows
rmdir /s /q android
rmdir /s /q ios

# Mac/Linux
rm -rf android
rm -rf ios
```

### 2. Remove Cache Folders

```bash
# Windows
rmdir /s /q .expo

# Mac/Linux
rm -rf .expo
```

### 3. Remove Build Artifacts

```bash
# Windows
rmdir /s /q build
rmdir /s /q dist

# Mac/Linux
rm -rf build
rm -rf dist
```

### 4. Clear Metro Cache

```bash
# Windows
rmdir /s /q node_modules\.cache

# Mac/Linux
rm -rf node_modules/.cache
```

### 5. Clear Watchman Cache (if installed)

```bash
watchman watch-del-all
```

### 6. Remove Temporary Files

```bash
# Windows
del /q /s *.log
del /q /s .DS_Store
del /q /s Thumbs.db

# Mac/Linux
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
```

---

## Complete Fresh Start (Optional)

If you want to remove `node_modules` too:

```bash
# Windows
rmdir /s /q node_modules
npm install

# Mac/Linux
rm -rf node_modules
npm install
```

---

## After Cleanup - Build with EAS

### Step 1: Verify Configuration

Check `app.json` has the correct projectId:

```json
"extra": {
  "eas": {
    "projectId": "9e287073-a26f-48b7-98ef-516ffbb4964f"
  }
}
```

### Step 2: Build with EAS

```bash
# Development build
npx eas build --platform android --profile development

# Production build
npx eas build --platform android --profile production

# Preview/APK build
npx eas build --platform android --profile preview
```

---

## What Gets Removed

✅ **android/** - Native Android code (prebuild)
✅ **ios/** - Native iOS code (prebuild)
✅ **.expo/** - Expo cache
✅ **build/** - Build artifacts
✅ **dist/** - Distribution files
✅ **node_modules/.cache** - Metro bundler cache
✅ **watchman cache** - File watcher cache
✅ ***.log** - Log files
✅ **.DS_Store, Thumbs.db** - System files

---

## What Stays

✅ **node_modules/** - Dependencies (unless you manually remove)
✅ **src/** - Source code
✅ **components/** - React components
✅ **screens/** - Screen files
✅ **package.json** - Dependencies list
✅ **app.json** - Expo configuration
✅ **eas.json** - EAS configuration

---

## Verification

After cleanup, verify:

```bash
# Check no android/ios folders
dir android 2>nul || echo "✓ android/ removed"
dir ios 2>nul || echo "✓ ios/ removed"

# Check EAS is ready
npx eas whoami
npx eas project:info
```

---

## Build Commands

### Development Build (with Dev Client)

```bash
npx eas build --platform android --profile development
```

### Preview Build (APK)

```bash
npx eas build --platform android --profile preview
```

### Production Build (APK/AAB)

```bash
npx eas build --platform android --profile production
```

---

## Troubleshooting

### If build fails after cleanup:

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Verify EAS login:**
   ```bash
   npx eas whoami
   ```

4. **Check project:**
   ```bash
   npx eas project:info
   ```

---

## Important Notes

- ⚠️ **Don't commit** `android/` or `ios/` folders to git (they're generated)
- ✅ **EAS builds** don't need local `android/` or `ios/` folders
- ✅ **Prebuild** is only needed for local development builds
- ✅ **EAS** handles everything in the cloud

---

## Quick Reference

```bash
# Clean everything
clean-build.bat  # Windows
./clean-build.sh  # Mac/Linux

# Build with EAS
npx eas build --platform android --profile production

# Check status
npx eas build:list
```

---

## Next Steps

1. ✅ Run cleanup script
2. ✅ Verify `app.json` has correct projectId
3. ✅ Run `npx eas build --platform android --profile production`
4. ✅ Wait for build to complete
5. ✅ Download and install APK

---

That's it! Your project is now clean and ready for a fresh EAS build. 🚀

