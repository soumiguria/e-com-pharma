@echo off
echo ========================================
echo EAS Build Permission Fix
echo ========================================
echo.
echo Current situation:
echo - Project ID: dfc327da-2ff2-4ab9-8d6f-5bb53ab1e6bd
echo - Project owner: guria29
echo - Currently logged in as: soumiguria
echo.
echo Options:
echo 1. Login as guria29 (if you have access)
echo 2. Create new project under soumiguria account
echo.
echo Choose option (1 or 2):
set /p choice="Enter choice: "

if "%choice%"=="1" goto login_guria29
if "%choice%"=="2" goto create_new_project
goto end

:login_guria29
echo.
echo Logging out current user...
call npx expo logout
echo.
echo Please login as guria29 account...
call npx expo login
echo.
echo Verifying login...
call npx eas whoami
echo.
echo Now try building again:
echo   npx eas build --platform android --profile production
goto end

:create_new_project
echo.
echo Creating new project under soumiguria account...
echo.
echo Step 1: Removing old project ID from app.json...
echo.
echo Please manually remove the projectId from app.json:
echo   "eas": {
echo     "projectId": "dfc327da-2ff2-4ab9-8d6f-5bb53ab1e6bd"  <- Remove this line
echo   }
echo.
echo Or we can create a new project automatically...
echo.
pause
echo.
echo Creating new EAS project...
call npx eas init
echo.
echo New project created! Now you can build:
echo   npx eas build --platform android --profile production
goto end

:end
echo.
pause

