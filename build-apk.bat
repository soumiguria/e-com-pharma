@echo off
echo Building APK...

REM Kill any existing Java processes
taskkill /f /im java.exe 2>nul

REM Clean previous builds
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\build rmdir /s /q android\app\build

REM Set environment variables to avoid workspace issues
set GRADLE_OPTS=-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false -Dorg.gradle.configureondemand=false

REM Change to android directory and build
cd android
call gradlew.bat assembleRelease --no-daemon --no-build-cache --no-configure-on-demand

REM Check if APK was created
if exist app\build\outputs\apk\release\app-release.apk (
    echo.
    echo ✅ APK built successfully!
    echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo You can now install this APK on your device.
) else (
    echo.
    echo ❌ APK build failed!
    echo Please check the error messages above.
)

pause






