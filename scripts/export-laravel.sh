#!/bin/bash
# GatePassX - Export Laravel Source Zip with Public Build Packs
# Usage: ./scripts/export-laravel.sh [output-dir]

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

OUTPUT_DIR="${1:-/workspaces/dePass/release}"
LARAVEL_DIR="/workspaces/dePass/backend"
STAGING_DIR="${OUTPUT_DIR}/laravel-shared-hosting"
ZIP_FILE="${OUTPUT_DIR}/gatepassx-laravel-$(date +%Y%m%d-%H%M%S).zip"

echo -e "${YELLOW}=== GatePassX Laravel Export ===${NC}"
echo ""

# Step 1: Build frontend assets
echo -e "${GREEN}[1/4]${NC} Building Laravel frontend assets..."
cd "${LARAVEL_DIR}"
npm ci --silent 2>/dev/null || true
npm run build
echo -e "${GREEN}  ✅ Frontend assets built${NC}"
echo ""

# Step 2: Verify build output
echo -e "${GREEN}[2/4]${NC} Verifying build output..."
if [ ! -f "public/build/manifest.json" ]; then
  echo -e "${RED}  ❌ public/build/manifest.json not found!${NC}"
  exit 1
fi
echo -e "${GREEN}  ✅ Build manifest verified${NC}"
echo ""

# Step 3: Stage Laravel files
echo -e "${GREEN}[3/4]${NC} Staging Laravel files..."
rm -rf "${STAGING_DIR}"
mkdir -p "${STAGING_DIR}"

cp -a "${LARAVEL_DIR}/." "${STAGING_DIR}/"

# Remove development artifacts
rm -rf \
  "${STAGING_DIR}/.env" \
  "${STAGING_DIR}/.phpunit.result.cache" \
  "${STAGING_DIR}/database/database.sqlite" \
  "${STAGING_DIR}/vendor" \
  "${STAGING_DIR}/node_modules" \
  "${STAGING_DIR}/storage/framework/cache/data/"* \
  "${STAGING_DIR}/storage/framework/testing/"* \
  "${STAGING_DIR}/storage/framework/views/"*.php \
  "${STAGING_DIR}/storage/logs/"*.log \
  "${STAGING_DIR}/tests/" \
  "${STAGING_DIR}/PHASE1_README.md" \
  "${STAGING_DIR}/README.md"

echo -e "${GREEN}  ✅ Files staged${NC}"
echo ""

# Step 4: Create shared hosting bootstrap files
echo -e "${GREEN}[4/4]${NC} Creating shared hosting bootstrap..."

# Root index.php
cat > "${STAGING_DIR}/index.php" << 'PHP'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
PHP

# .htaccess for security
cat > "${STAGING_DIR}/.htaccess" << 'HTACCESS'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Block sensitive directories
    RewriteRule ^(?:app|bootstrap|config|database|resources|routes|storage|tests|vendor)(?:/|$) - [F,L]

    # Block sensitive files
    RewriteRule ^(?:artisan|composer\.(?:json|lock)|package(?:-lock)?\.json|phpunit\.xml|vite\.config\.js)$ - [F,L]

    # Authorization header passthrough
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    # Serve from public dir if exists
    RewriteCond %{DOCUMENT_ROOT}/public%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}/public%{REQUEST_URI} -d
    RewriteRule ^(.*)$ public/$1 [L]

    # Remove trailing slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Front controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

<FilesMatch "^\.">
    Require all denied
</FilesMatch>
HTACCESS

# Create zip
cd "${STAGING_DIR}"
zip -qr "../$(basename "${ZIP_FILE}")" .

echo -e "${GREEN}  ✅ Bootstrap files created${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Export Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  ZIP: ${ZIP_FILE}"
echo "  Size: $(du -h "${ZIP_FILE}" | cut -f1)"
echo ""
echo "  Deployment instructions:"
echo "  1. Upload gatepassx-laravel-*.zip to your shared hosting"
echo "  2. Extract in your document root"
echo "  3. Copy .env.example to .env and configure"
echo "  4. Point your domain to the extracted directory"
echo "  5. Ensure storage/ is writable"
echo ""
