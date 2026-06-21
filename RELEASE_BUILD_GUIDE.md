# GatePassX Release Build - Complete Guide

## 🔑 Step 1: Generate Android Keystore

### Command
```bash
keytool -genkey -v -keystore /workspaces/dePass/android/app/gatepassx.keystore \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias DevnBugs \
    -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" \
    -storepass gatepassx2026 \
    -keypass gatepassx2026
```

### Details
- **Keystore Path**: `/workspaces/dePass/android/app/gatepassx.keystore`
- **Alias**: `DevnBugs`
- **Name**: `Rabiu Hadi Salisu`
- **Organization**: `Rabyte NG`
- **Location**: `Kano, KN`
- **Store Password**: `gatepassx2026`
- **Key Password**: `gatepassx2026`
- **Algorithm**: RSA 2048-bit
- **Validity**: 10000 days (~27 years)

---

## 🔐 Step 2: Create key.properties

### Command
```bash
cat > /workspaces/dePass/android/key.properties << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF
```

### File Location
```
/workspaces/dePass/android/key.properties
```

### Content
```properties
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
```

---

## 🚀 Step 3: Build Flutter Release APK

### Pre-Build
```bash
cd /workspaces/dePass/mobile
export PATH="$PATH:/tmp/flutter/bin"
flutter clean
flutter pub get
```

### Build Command
```bash
flutter build apk --release
```

### Alternative: Build Both ARM64 and x86_64
```bash
flutter build apk --release --split-per-abi
```

### Output
```
File: /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk
```

### Complete Build Script
```bash
#!/bin/bash
cd /workspaces/dePass/mobile
export PATH="$PATH:/tmp/flutter/bin"

# Clean
flutter clean

# Get dependencies
flutter pub get

# Run analysis
flutter analyze

# Run tests
flutter test

# Build release APK
flutter build apk --release

echo "✅ APK built successfully!"
echo "Location: $(pwd)/build/app/outputs/apk/release/app-release.apk"
ls -lh build/app/outputs/apk/release/app-release.apk
```

---

## 🏗️ Step 4: Build & Run Laravel Backend

### Setup Database
```bash
cd /workspaces/dePass/backend

# Copy environment
cp .env.example .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed
```

### Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Run Development Server
```bash
cd /workspaces/dePass/backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Run with Multiple Options
```bash
# With debug enabled
php artisan serve --host=0.0.0.0 --port=8000 --env=local

# In background
nohup php artisan serve --host=0.0.0.0 --port=8000 > laravel.log 2>&1 &

# With npm dev server (Vite)
npm run dev
```

---

## 🔗 Complete Automated Script

### Quick Start (One Command)
```bash
chmod +x /workspaces/dePass/build-release.sh
/workspaces/dePass/build-release.sh
```

### Or Run Commands Sequentially

```bash
# 1. Generate Keystore
keytool -genkey -v -keystore /workspaces/dePass/android/app/gatepassx.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias DevnBugs \
    -dname "CN=Rabiu Hadi Salisu,OU=DevnBugs,O=Rabyte NG,L=Kano,ST=KN,C=NG" \
    -storepass gatepassx2026 -keypass gatepassx2026

# 2. Create key.properties
mkdir -p /workspaces/dePass/android
cat > /workspaces/dePass/android/key.properties << 'EOF'
storePassword=gatepassx2026
keyPassword=gatepassx2026
keyAlias=DevnBugs
storeFile=../app/gatepassx.keystore
EOF

# 3. Build Flutter Release APK
cd /workspaces/dePass/mobile
export PATH="$PATH:/tmp/flutter/bin"
flutter clean && flutter pub get && flutter build apk --release

# 4. Setup and Run Laravel
cd /workspaces/dePass/backend
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000
```

---

## 📱 Install APK on Device/Emulator

### Via ADB (Android Debug Bridge)
```bash
# Connect device or start emulator
adb devices

# Install APK
adb install /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk

# Uninstall
adb uninstall com.example.gatepassx

# Reinstall
adb install -r /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk

# View logs
adb logcat -s flutter
```

### Via File Transfer
```bash
# Copy to device
adb push /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk /sdcard/Download/

# Then install from Files app on device
```

---

## 🔍 Verify Build Artifacts

```bash
# Check keystore
keytool -list -v -keystore /workspaces/dePass/android/app/gatepassx.keystore -storepass gatepassx2026

# Check APK
ls -lh /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk

# Extract APK info
unzip -l /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk | head -20

# Check API endpoint connectivity
curl -X GET http://localhost:8000/api/auth/check
```

---

## 🌍 Configure Mobile to Connect to Backend

Edit `/workspaces/dePass/mobile/lib/src/providers/session_provider.dart`:

```dart
// Update API base URL
class SessionProvider extends ChangeNotifier {
  static const String _apiBaseUrl = 'http://YOUR_IP:8000/api';
  // For local testing: 'http://10.0.2.2:8000/api' (Android emulator)
  // For device: 'http://192.168.x.x:8000/api'
}
```

---

## 📊 Build Verification Checklist

- [ ] Keystore generated with correct details
- [ ] key.properties file created
- [ ] Flutter clean completed
- [ ] Dependencies resolved
- [ ] Tests passed
- [ ] Flutter analyze: 0 issues
- [ ] APK built successfully
- [ ] APK size reasonable (~50-80MB)
- [ ] Laravel migrations complete
- [ ] Database created
- [ ] Server running on port 8000
- [ ] API endpoints responding
- [ ] Mobile app installed on device/emulator
- [ ] Mobile connects to backend
- [ ] Login works end-to-end

---

## 🚨 Troubleshooting

### Keystore Issues
```bash
# List keystore contents
keytool -list -v -keystore /workspaces/dePass/android/app/gatepassx.keystore

# Delete corrupted keystore
rm /workspaces/dePass/android/app/gatepassx.keystore
# Then regenerate with command above
```

### Build Issues
```bash
# Clean build
flutter clean
rm -rf build/
flutter pub get

# Check Flutter setup
flutter doctor

# Verbose build
flutter build apk --release -v
```

### Laravel Issues
```bash
# Check migrations
php artisan migrate:status

# Rollback migrations
php artisan migrate:rollback

# Fresh migrate
php artisan migrate:fresh --seed

# Check routes
php artisan route:list

# Check logs
tail -f storage/logs/laravel.log
```

### APK Installation Issues
```bash
# Uninstall first
adb uninstall com.example.gatepassx

# Clear cache
adb shell pm clear com.example.gatepassx

# Then reinstall
adb install /workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk
```

---

## 📋 File Locations Summary

| Item | Path |
|------|------|
| Keystore | `/workspaces/dePass/android/app/gatepassx.keystore` |
| Key Properties | `/workspaces/dePass/android/key.properties` |
| Release APK | `/workspaces/dePass/mobile/build/app/outputs/apk/release/app-release.apk` |
| Laravel .env | `/workspaces/dePass/backend/.env` |
| Database | `/workspaces/dePass/backend/database/database.sqlite` |
| Build Script | `/workspaces/dePass/build-release.sh` |

---

## ✅ Release Information

**App**: GatePassX Version 2026.07.22  
**Keystore Alias**: DevnBugs  
**Owner**: Rabiu Hadi Salisu  
**Organization**: Rabyte NG  
**Location**: Kano, KN, Nigeria  

---

Generated: 2026-06-21
