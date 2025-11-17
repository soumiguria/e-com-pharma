@echo off
echo ========================================
echo Expo Dev Client Setup for Voice Recognition
echo ========================================
echo.

echo Step 1: Cleaning previous builds...
if exist android (
    echo Removing android folder...
    rmdir /s /q android
)

echo.
echo Step 2: Running prebuild...
call npx expo prebuild --clean --platform android

if errorlevel 1 (
    echo.
    echo ERROR: Prebuild failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Verifying AndroidManifest.xml...
findstr /C:"RECORD_AUDIO" android\app\src\main\AndroidManifest.xml >nul
if errorlevel 1 (
    echo WARNING: RECORD_AUDIO permission not found in AndroidManifest.xml
) else (
    echo SUCCESS: RECORD_AUDIO permission found
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open Android Studio
echo 2. Open the 'android' folder
echo 3. Wait for Gradle sync
echo 4. Build and run the app (Shift+F10)
echo 5. After app installs, run: npm run start:dev
echo.
echo OR use command line:
echo   npx expo run:android
echo.
pause

