#!/bin/bash

echo "========================================"
echo "Complete Build Cleanup for Fresh EAS Build"
echo "========================================"
echo ""
echo "This will remove:"
echo "- android/ folder (prebuild)"
echo "- ios/ folder (prebuild)"
echo "- build/ folders"
echo "- .expo/ cache"
echo "- node_modules/.cache"
echo "- Metro bundler cache"
echo ""

read -p "Are you sure? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Removing android/ folder..."
if [ -d "android" ]; then
    rm -rf android
    echo "✓ android/ removed"
else
    echo "- android/ not found"
fi

echo ""
echo "Step 2: Removing ios/ folder..."
if [ -d "ios" ]; then
    rm -rf ios
    echo "✓ ios/ removed"
else
    echo "- ios/ not found"
fi

echo ""
echo "Step 3: Removing .expo/ cache..."
if [ -d ".expo" ]; then
    rm -rf .expo
    echo "✓ .expo/ removed"
else
    echo "- .expo/ not found"
fi

echo ""
echo "Step 4: Removing build artifacts..."
if [ -d "build" ]; then
    rm -rf build
    echo "✓ build/ removed"
fi

if [ -d "dist" ]; then
    rm -rf dist
    echo "✓ dist/ removed"
fi

echo ""
echo "Step 5: Clearing Metro bundler cache..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✓ Metro cache cleared"
fi

echo ""
echo "Step 6: Removing watchman cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null
    echo "✓ watchman cache cleared"
else
    echo "- watchman not installed"
fi

echo ""
echo "Step 7: Removing temporary files..."
find . -name "*.log" -type f -delete 2>/dev/null
find . -name ".DS_Store" -type f -delete 2>/dev/null
find . -name "Thumbs.db" -type f -delete 2>/dev/null

echo ""
echo "========================================"
echo "Cleanup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Build with EAS: npx eas build --platform android --profile production"
echo ""
echo "Note: node_modules/ was NOT removed."
echo "      If you want a complete fresh start, run:"
echo "      rm -rf node_modules"
echo "      npm install"
echo ""

