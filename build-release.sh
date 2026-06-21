#!/bin/bash
# GatePassX Release Build Script
# Generates keystore, builds Flutter release APK, and starts Laravel backend

set -e

echo "=========================================="
echo "GatePassX Release Build Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================
# Step 1: Generate Android Keystore
# ==========================================
echo -e "${BLUE}[1/4]${NC} Generating Android Keystore..."
echo ""

KEYSTORE_PATH="/workspaces/dePass/android/app/gatepassx.keystore"

if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}⚠️  Keystore already exists at $KEYSTORE_PATH${NC}"
    read -p "Do you want to regenerate it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing keystore..."
    else
        rm "$KEYSTORE_PATH"
        echo "Generating new keystore..."
        keytool -genkey -v -keystore "$KEYSTORE_PATH" \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -alias DevnBugs \
            -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" \
            -storepass gatepassx2026 \
            -keypass gatepassx2026
        echo -e "${GREEN}✅ Keystore generated successfully!${NC}"
    fi
else
    echo "Generating new keystore..."
    mkdir -p "$(dirname "$KEYSTORE_PATH")"
    keytool -genkey -v -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias DevnBugs \
        -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" \
        -storepass gatepassx2026 \
        -keypass gatepassx2026
    echo -e "${GREEN}✅ Keystore generated successfully!${NC}"
    chmod 600 "$KEYSTORE_PATH"
fi

echo ""
echo "Keystore Details:"
echo "  Path: $KEYSTORE_PATH"
echo "  Alias: DevnBugs"
echo "  Owner: Rabiu Hadi Salisu"
echo "  Organization: Rabyte NG"
echo "  Location: Kano, KN"
echo "  Store Password: gatepassx2026"
echo "  Key Password: gatepassx2026"
echo ""

# ==========================================
# Step 2: Create key.properties
# ==========================================
echo -e "${BLUE}[2/4]${NC} Creating key.properties..."
echo ""

KEY_PROPS_PATH="/workspaces/dePass/android/key.properties"

cat > "$KEY_PROPS_PATH" << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF

echo -e "${GREEN}✅ key.properties created!${NC}"
echo "  Path: $KEY_PROPS_PATH"
echo ""

# ==========================================
# Step 3: Build Flutter Release APK
# ==========================================
echo -e "${BLUE}[3/4]${NC} Building Flutter Release APK..."
echo ""

cd /workspaces/dePass/mobile

export PATH="$PATH:/tmp/flutter/bin"

flutter clean
echo -e "${YELLOW}Building release APK...${NC}"
flutter build apk --release 2>&1 | tail -20

if [ -f "/workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk" ]; then
    echo -e "${GREEN}✅ APK built successfully!${NC}"
    APK_SIZE=$(du -h /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk | cut -f1)
    echo "  File: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
    echo "  Size: $APK_SIZE"
else
    echo -e "${YELLOW}⚠️  APK build may require Android SDK${NC}"
fi

echo ""

# ==========================================
# Step 4: Start Laravel Backend
# ==========================================
echo -e "${BLUE}[4/4]${NC} Starting Laravel Backend..."
echo ""

cd /workspaces/dePass/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
php artisan migrate --force

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Start Laravel development server
echo -e "${YELLOW}Starting Laravel development server...${NC}"
echo -e "${GREEN}✅ Backend ready!${NC}"
echo ""
echo "Laravel Server Details:"
echo "  URL: http://localhost:8000"
echo "  Database: SQLite"
echo "  DB File: /workspaces/dePass/backend/database/database.sqlite"
echo ""

# Display API routes
echo "Available API Endpoints:"
php artisan route:list | grep api | head -15

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Build Complete!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Run: php artisan serve"
echo "2. APK location: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
echo "3. Install APK on device: adb install app-release.apk"
echo "4. Mobile app will connect to http://your-ip:8000/api"
echo ""
