@echo off
echo ========================================
echo Building APK for Paas Ki Dukaan
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

REM Check if Android directory exists, if not run prebuild
if not exist android (
    echo.
    echo 📦 Android native code not found. Running prebuild...
    echo This will generate the Android project from your Expo config.
    echo.
    call npx expo prebuild --platform android --clean
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Prebuild failed! Please check the error messages above.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Prebuild completed successfully!
    echo.
) else (
    echo.
    echo ℹ️  Android directory found. Skipping prebuild.
    echo    (Delete the android folder if you want to regenerate it)
    echo.
)

REM Kill any existing Java processes (optional, helps avoid port conflicts)
echo 🧹 Cleaning up Java processes...
taskkill /f /im java.exe 2>nul

REM Clean previous builds
echo 🧹 Cleaning previous build artifacts...
if exist android\.gradle rmdir /s /q android\.gradle 2>nul
if exist android\app\build rmdir /s /q android\app\build 2>nul

REM Set environment variables to avoid workspace issues
set GRADLE_OPTS=-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false -Dorg.gradle.configureondemand=false

REM Change to android directory and build
echo.
echo 🔨 Building APK (this may take several minutes)...
echo.
cd android
call gradlew.bat assembleRelease --no-daemon --no-build-cache --no-configure-on-demand

REM Check if APK was created
if exist app\build\outputs\apk\release\app-release.apk (
    echo.
    echo ========================================
    echo ✅ APK built successfully!
    echo ========================================
    echo.
    echo 📱 APK location: %CD%\app\build\outputs\apk\release\app-release.apk
    echo.
    echo You can now install this APK on your Android device.
    echo.
    echo To install:
    echo   1. Transfer the APK to your Android device
    echo   2. Enable "Install from Unknown Sources" in settings
    echo   3. Open the APK file and install
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ APK build failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
    echo Common issues:
    echo   - Make sure Java JDK is installed
    echo   - Make sure Android SDK is properly configured
    echo   - Check that all dependencies are installed (npm install)
    echo.
)

cd ..
pause






