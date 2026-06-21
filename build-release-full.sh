#!/bin/bash
# GatePassX Release Build Script - WITH DEBUG LOGGING
# Installs tools, generates keystore, builds Flutter release APK, and starts Laravel backend

set -e

echo "=========================================="
echo "GatePassX Release Build Script - DEBUG"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==========================================
# Step 0: Install Required Tools
# ==========================================
echo -e "${BLUE}[0/5]${NC} Installing Required Tools..."
echo ""

# Check and install Android SDK
echo -e "${YELLOW}Checking Android SDK...${NC}"
if ! command -v sdkmanager &> /dev/null; then
    echo -e "${YELLOW}Installing Android SDK...${NC}"
    export ANDROID_HOME=/opt/android-sdk
    mkdir -p $ANDROID_HOME
    
    # Download and install Android SDK Command Line Tools
    cd /tmp
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    unzip -q commandlinetools-linux-11076708_latest.zip -d $ANDROID_HOME
    mv $ANDROID_HOME/cmdline-tools $ANDROID_HOME/cmdline-tools-latest
    mkdir -p $ANDROID_HOME/cmdline-tools/latest
    mv $ANDROID_HOME/cmdline-tools-latest/* $ANDROID_HOME/cmdline-tools/latest/
    
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
    
    # Accept licenses
    yes | sdkmanager --licenses
    
    # Install required SDK components
    sdkmanager "build-tools;35.0.0" "platforms;android-35" "ndk;27.0.12077973"
    
    echo -e "${GREEN}✅ Android SDK installed!${NC}"
else
    echo -e "${GREEN}✅ Android SDK already installed${NC}"
    export ANDROID_HOME=/opt/android-sdk
fi

echo ""

# Verify PHP 8.4
echo -e "${YELLOW}Verifying PHP 8.4...${NC}"
PHP_CMD=$(/usr/bin/php8.4 --version)
if echo "$PHP_CMD" | grep -q "8.4"; then
    echo -e "${GREEN}✅ PHP 8.4 verified!${NC}"
    PHP_EXECUTABLE="/usr/bin/php8.4"
else
    echo -e "${RED}❌ PHP 8.4 not found!${NC}"
    exit 1
fi

echo ""

# Verify Flutter
echo -e "${YELLOW}Verifying Flutter...${NC}"
export PATH="$PATH:/tmp/flutter/bin"
if command -v flutter &> /dev/null; then
    echo -e "${GREEN}✅ Flutter verified!${NC}"
    flutter --version
else
    echo -e "${RED}❌ Flutter not found!${NC}"
    exit 1
fi

echo ""

# ==========================================
# Step 1: Generate Android Keystore
# ==========================================
echo -e "${BLUE}[1/5]${NC} Generating Android Keystore..."
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

# ==========================================
# Step 2: Create key.properties
# ==========================================
echo -e "${BLUE}[2/5]${NC} Creating key.properties..."
echo ""

KEY_PROPS_PATH="/workspaces/dePass/android/key.properties"

cat > "$KEY_PROPS_PATH" << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF

echo -e "${GREEN}✅ key.properties created!${NC}"

echo ""

# ==========================================
# Step 3: Build Flutter Release APK (WITH DEBUG)
# ==========================================
echo -e "${BLUE}[3/5]${NC} Building Flutter Release APK..."
echo ""

cd /workspaces/dePass/mobile

export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo -e "${YELLOW}Cleaning Flutter project...${NC}"
flutter clean --verbose

echo -e "${YELLOW}Getting Flutter dependencies...${NC}"
flutter pub get --verbose

echo -e "${YELLOW}Running Flutter analyze...${NC}"
flutter analyze

echo -e "${YELLOW}Building release APK with verbose output...${NC}"
flutter build apk --release --verbose 2>&1 | tee flutter-build.log

if [ -f "/workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk" ]; then
    echo -e "${GREEN}✅ APK built successfully!${NC}"
    APK_SIZE=$(du -h /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk | cut -f1)
    echo "  File: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
    echo "  Size: $APK_SIZE"
else
    echo -e "${RED}❌ APK build failed!${NC}"
    echo "Check flutter-build.log for details"
    exit 1
fi

echo ""

# ==========================================
# Step 4: Setup Laravel Backend
# ==========================================
echo -e "${BLUE}[4/5]${NC} Setting up Laravel Backend..."
echo ""

cd /workspaces/dePass/backend

# Use PHP 8.4
echo -e "${YELLOW}Using PHP 8.4 for Laravel...${NC}"
ln -sf /usr/bin/php8.4 /tmp/php-cli 2>/dev/null || true
export PHP_CMD="/usr/bin/php8.4"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    $PHP_CMD artisan key:generate
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
$PHP_CMD artisan migrate --force --verbose

# Clear caches
echo -e "${YELLOW}Clearing caches...${NC}"
$PHP_CMD artisan config:clear
$PHP_CMD artisan cache:clear
$PHP_CMD artisan route:clear
$PHP_CMD artisan view:clear

echo -e "${GREEN}✅ Laravel setup complete!${NC}"

echo ""

# ==========================================
# Step 5: Summary & Next Steps
# ==========================================
echo -e "${BLUE}[5/5]${NC} Build Complete!"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ ALL BUILDS SUCCESSFUL!${NC}"
echo "=========================================="
echo ""

echo "Build Summary:"
echo "  ✅ PHP 8.4 verified"
echo "  ✅ Android SDK ready"
echo "  ✅ Flutter verified"
echo "  ✅ Keystore generated"
echo "  ✅ APK built: $(du -h /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk | cut -f1)"
echo "  ✅ Laravel migrations completed"
echo ""

echo "File Locations:"
echo "  📱 APK: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
echo "  🔑 Keystore: /workspaces/dePass/android/app/gatepassx.keystore"
echo "  📝 Config: /workspaces/dePass/android/key.properties"
echo "  🏗️ Laravel: /workspaces/dePass/backend"
echo "  💾 Database: /workspaces/dePass/backend/database/database.sqlite"
echo ""

echo "Next Steps:"
echo "  1. Start Laravel server:"
echo "     $PHP_CMD /workspaces/dePass/backend/artisan serve --host=0.0.0.0 --port=8000"
echo ""
echo "  2. Install APK on device:"
echo "     adb install /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
echo ""
echo "  3. View build logs:"
echo "     tail -f /workspaces/dePass/mobile/flutter-build.log"
echo ""

# Display available API routes
echo "Available API Endpoints:"
$PHP_CMD /workspaces/dePass/backend/artisan route:list | grep api | head -20

echo ""
