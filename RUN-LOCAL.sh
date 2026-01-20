#!/bin/bash

echo "========================================"
echo " تثبيت نسخة محلية من نظام إدارة أكاديمي"
echo "Local Academic Management System Setup"
echo "========================================"
echo ""

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js غير مثبت!"
    echo "الرجاء تثبيت Node.js من: https://nodejs.org"
    exit 1
fi
echo "[OK] Node.js مثبت بنجاح"
echo ""

# التحقق من Bun
if ! command -v bun &> /dev/null; then
    echo "[ERROR] Bun غير مثبت!"
    echo "للتثبيت Bun، اتبع التعليمات على: https://bun.sh"
    exit 1
fi
echo "[OK] Bun مثبت بنجاح"
echo ""

# تثبيت الحزم
echo "جاري تثبيت الحزم..."
bun install
if [ $? -ne 0 ]; then
    echo "[ERROR] فشل في تثبيت الحزم!"
    exit 1
fi
echo "[OK] تم تثبيت الحزم بنجاح"
echo ""

# إنشاء ملف .env إذا لم يكن موجود
if [ ! -f .env ]; then
    echo "[INFO] جاري إنشاء ملف .env..."
    cat > .env << EOF
DATABASE_URL="postgresql://neondb_owner:npg_aNTE8eCxRB1b@ep-steep-pond-a16wpsaq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="academic-system-secure-key-2024"
EOF
    echo "[OK] تم إنشاء ملف .env"
else
    echo "[OK] ملف .env موجود"
fi

# تشغيل الخادم
echo ""
echo "========================================"
echo "جاري تشغيل الخادم المحلي..."
echo "Starting Local Server..."
echo "========================================"
echo ""
echo "البرنامج سيعمل على: http://localhost:3000"
echo "لإيقاف، اضغط: Ctrl + C"
echo ""
bun run dev
