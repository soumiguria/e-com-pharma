@echo off
echo ========================================
echo Complete Build Cleanup for Fresh EAS Build
echo ========================================
echo.
echo This will remove:
echo - android/ folder (prebuild)
echo - ios/ folder (prebuild)
echo - build/ folders
echo - .expo/ cache
echo - node_modules/.cache
echo - Metro bundler cache
echo.
set /p confirm="Are you sure? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Step 1: Removing android/ folder...
if exist android (
    rmdir /s /q android
    echo ✓ android/ removed
) else (
    echo - android/ not found
)

echo.
echo Step 2: Removing ios/ folder...
if exist ios (
    rmdir /s /q ios
    echo ✓ ios/ removed
) else (
    echo - ios/ not found
)

echo.
echo Step 3: Removing .expo/ cache...
if exist .expo (
    rmdir /s /q .expo
    echo ✓ .expo/ removed
) else (
    echo - .expo/ not found
)

echo.
echo Step 4: Removing build artifacts...
if exist build (
    rmdir /s /q build
    echo ✓ build/ removed
) else (
    echo - build/ not found
)

if exist dist (
    rmdir /s /q dist
    echo ✓ dist/ removed
)

echo.
echo Step 5: Clearing Metro bundler cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Metro cache cleared
)

echo.
echo Step 6: Removing watchman cache...
call watchman watch-del-all 2>nul
if errorlevel 1 (
    echo - watchman not installed or no cache
) else (
    echo ✓ watchman cache cleared
)

echo.
echo Step 7: Removing temporary files...
del /q /s *.log 2>nul
del /q /s .DS_Store 2>nul
del /q /s Thumbs.db 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install dependencies: npm install
echo 2. Build with EAS: npx eas build --platform android --profile production
echo.
echo Note: node_modules/ was NOT removed.
echo       If you want a complete fresh start, run:
echo       rmdir /s /q node_modules
echo       npm install
echo.
pause

