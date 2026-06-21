# Quick Command Reference - Copy & Paste Ready

## 🔑 Generate Keystore (One Command)
```bash
keytool -genkey -v -keystore /workspaces/dePass/android/app/gatepassx.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias DevnBugs -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" -storepass gatepassx2026 -keypass gatepassx2026
```

## 🔐 Create key.properties
```bash
cat > /workspaces/dePass/android/key.properties << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF
```

## 📱 Build Flutter Release APK
```bash
cd /workspaces/dePass/mobile && export PATH="$PATH:/tmp/flutter/bin" && flutter clean && flutter pub get && flutter build apk --release
```

## 🏗️ Setup Laravel Backend
```bash
cd /workspaces/dePass/backend && cp .env.example .env && php artisan key:generate && php artisan migrate --force
```

## ▶️ Run Laravel Development Server
```bash
cd /workspaces/dePass/backend && php artisan serve --host=0.0.0.0 --port=8000
```

## 🚀 Run Automated Build Script
```bash
chmod +x /workspaces/dePass/build-release.sh && /workspaces/dePass/build-release.sh
```

## 📱 Install APK on Device/Emulator
```bash
adb install /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk
```

## ✅ Verify All Steps
```bash
# 1. Check keystore
keytool -list -v -keystore /workspaces/dePass/android/app/gatepassx.keystore -storepass gatepassx2026

# 2. Check APK size
ls -lh /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk

# 3. Check Laravel running
curl http://localhost:8000/api/auth/check

# 4. Check database
ls -lh /workspaces/dePass/backend/database/database.sqlite
```

## 🔄 Complete Build in Sequence
```bash
# 1. Generate keystore
keytool -genkey -v -keystore /workspaces/dePass/android/app/gatepassx.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias DevnBugs -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" -storepass gatepassx2026 -keypass gatepassx2026

# 2. Create key.properties
mkdir -p /workspaces/dePass/android && cat > /workspaces/dePass/android/key.properties << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF

# 3. Build Flutter APK
cd /workspaces/dePass/mobile && export PATH="$PATH:/tmp/flutter/bin" && flutter clean && flutter pub get && flutter build apk --release && echo "✅ APK built at: $(pwd)/build/app/outputs/apk/release/app-release.apk"

# 4. Setup Laravel
cd /workspaces/dePass/backend && cp .env.example .env && php artisan key:generate && php artisan migrate --force && php artisan config:clear && php artisan cache:clear

# 5. Run Laravel
cd /workspaces/dePass/backend && php artisan serve --host=0.0.0.0 --port=8000 &

# 6. Display info
echo "✅ Build Complete!"
echo "📱 APK: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
echo "🏗️ Backend: http://localhost:8000"
echo "📊 Database: /workspaces/dePass/backend/database/database.sqlite"
```

## 🎯 All-in-One Bash Function
Add this to your ~/.bashrc or run directly:

```bash
build_gatepassx() {
    echo "🚀 Starting GatePassX Release Build..."
    
    # 1. Keystore
    echo "📌 Step 1: Generating keystore..."
    keytool -genkey -v -keystore /workspaces/dePass/android/app/gatepassx.keystore \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias DevnBugs \
        -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" \
        -storepass gatepassx2026 -keypass gatepassx2026 2>/dev/null || echo "✅ Keystore exists"
    
    # 2. Key properties
    echo "📌 Step 2: Creating key.properties..."
    mkdir -p /workspaces/dePass/android
    cat > /workspaces/dePass/android/key.properties << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF
    
    # 3. Build Flutter
    echo "📌 Step 3: Building Flutter release APK..."
    cd /workspaces/dePass/mobile
    export PATH="$PATH:/tmp/flutter/bin"
    flutter clean && flutter pub get && flutter build apk --release
    
    # 4. Setup Laravel
    echo "📌 Step 4: Setting up Laravel..."
    cd /workspaces/dePass/backend
    cp .env.example .env
    php artisan key:generate
    php artisan migrate --force
    
    echo "✅ Build complete!"
    echo "📱 APK: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk"
    echo "🏗️ Run: cd /workspaces/dePass/backend && php artisan serve --host=0.0.0.0 --port=8000"
}

# Usage: build_gatepassx
```

---

## 📋 Keystore Information

**Created For:**
- Name: Rabiu Hadi Salisu
- Username: DevnBugs
- Organization: Rabyte NG
- Location: Kano, KN
- Country: Nigeria (NG)

**Credentials:**
- Store Password: `gatepassx2026`
- Key Password: `gatepassx2026`
- Algorithm: RSA 2048-bit
- Validity: 10,000 days

**Paths:**
- Keystore: `/workspaces/dePass/android/app/gatepassx.keystore`
- Key Config: `/workspaces/dePass/android/key.properties`

---

## 🌍 Network Setup for Testing

### For Android Emulator (connect to localhost):
```bash
# In mobile app, set API URL to:
http://10.0.2.2:8000/api
```

### For Physical Device (LAN):
```bash
# Find your machine IP
hostname -I

# Use that IP in mobile app:
http://192.168.x.x:8000/api  # Replace x.x with actual IP
```

### Test Connectivity:
```bash
# From device/emulator
curl http://10.0.2.2:8000/api/auth/check

# Or with specific endpoint
curl -X POST http://10.0.2.2:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

---

**Last Updated**: 2026-06-21  
**App Version**: GatePassX Version 2026.07.22
