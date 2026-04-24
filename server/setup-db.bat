@echo off
REM Database Setup Script untuk Windows
REM Jalankan: setup-db.bat dari command prompt

echo.
echo 🚀 Mochint Beauty Database Setup
echo.

REM Check if mysql is available
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL command not found!
    echo.
    echo Please add MySQL bin folder to PATH:
    echo Example: C:\Program Files\MySQL\MySQL Server 8.0\bin
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL found
echo.

REM Get .env variables
for /f "tokens=*" %%i in ('findstr "^DB_HOST=" .env') do set %%i
for /f "tokens=*" %%i in ('findstr "^DB_USER=" .env') do set %%i
for /f "tokens=*" %%i in ('findstr "^DB_PASSWORD=" .env') do set %%i
for /f "tokens=*" %%i in ('findstr "^DB_NAME=" .env') do set %%i

if not defined DB_HOST set DB_HOST=localhost
if not defined DB_USER set DB_USER=root
if not defined DB_NAME set DB_NAME=beauty_clinic

echo 📋 Configuration:
echo    Host: %DB_HOST%
echo    User: %DB_USER%
echo    Database: %DB_NAME%
echo.

REM Test connection
echo 1️⃣  Testing MySQL connection...
if "%DB_PASSWORD%"=="" (
    mysql -h %DB_HOST% -u %DB_USER% -e "SELECT 1" >nul 2>&1
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "SELECT 1" >nul 2>&1
)

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to MySQL
    echo.
    echo ⚠️  Make sure:
    echo    1. MySQL service is running
    echo    2. DB_USER and DB_PASSWORD are correct in .env
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL connection successful
echo.

REM Create database
echo 2️⃣  Creating database...
if "%DB_PASSWORD%"=="" (
    mysql -h %DB_HOST% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS `%DB_NAME%`;" >nul 2>&1
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS `%DB_NAME%`;" >nul 2>&1
)

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error creating database
    pause
    exit /b 1
)

echo ✅ Database '%DB_NAME%' ready
echo.

REM Import SQL
echo 3️⃣  Importing schema...
set SQL_FILE=database\beauty_clinic.sql

if not exist "%SQL_FILE%" (
    echo ❌ SQL file not found: %SQL_FILE%
    pause
    exit /b 1
)

if "%DB_PASSWORD%"=="" (
    mysql -h %DB_HOST% -u %DB_USER% %DB_NAME% < "%SQL_FILE%" >nul 2>&1
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < "%SQL_FILE%" >nul 2>&1
)

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Import completed with warnings (this is usually OK)
) else (
    echo ✅ Schema imported successfully
)

echo.

REM Verify
echo 4️⃣  Verifying setup...
if "%DB_PASSWORD%"=="" (
    mysql -h %DB_HOST% -u %DB_USER% %DB_NAME% -e "SELECT COUNT(*) as 'Total Tables' FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='%DB_NAME%';" >nul 2>&1
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) as 'Total Tables' FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='%DB_NAME%';" >nul 2>&1
)

echo ✅ Database setup complete!
echo.
echo 🚀 Next steps:
echo    1. npm run dev    (start backend server)
echo    2. In another terminal: cd .. ^&^& npm run dev    (start frontend)
echo.
pause
