@echo off
echo ========================================
echo  تثبيت نسخة محلية من نظام إدارة أكاديمي
echo Local Academic Management System Setup
echo ========================================
echo.

REM التحقق من Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js غير مثبت!
    echo الرجاء تثبيت Node.js من: https://nodejs.org
    pause
    exit /b
)

echo [OK] Node.js مثبت بنجاح
echo.

REM التحقق من Bun
bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Bun غير مثبت!
    echo الرجاء تثبيت Bun من: https://bun.sh
    echo.
    echo لتثبيت Bun، افتح PowerShell وأدخل:
    echo irm bun.sh/install.ps1 ^| iex
    pause
    exit /b
)

echo [OK] Bun مثبت بنجاح
echo.

REM تثبيت الحزم
echo جاري تثبيت الحزم...
bun install
if %errorlevel% neq 0 (
    echo [ERROR] فشل في تثبيت الحزم!
    pause
    exit /b
)

echo [OK] تم تثبيت الحزم بنجاح
echo.

REM إنشاء ملف .env إذا لم يكن موجود
if not exist .env (
    echo [INFO] جاري إنشاء ملف .env...
    (
        echo DATABASE_URL="postgresql://neondb_owner:npg_aNTE8eCxRB1b@ep-steep-pond-a16wpsaq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require^&channel_binding=require"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="academic-system-secure-key-2024"
    ) > .env
    echo [OK] تم إنشاء ملف .env
) else (
    echo [OK] ملف .env موجود
)

REM تشغيل الخادم
echo.
echo ========================================
echo جاري تشغيل الخادم المحلي...
echo Starting Local Server...
echo ========================================
echo.
echo البرنامج سيعمل على: http://localhost:3000
echo للإيقاف، اضغط: Ctrl + C
echo.
bun run dev

pause
