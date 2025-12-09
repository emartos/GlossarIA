#!/bin/bash

# Configuración
REPO_DIR="/var/www/html/glossaria"
LOG_FILE="/var/log/glossaria-deploy.log"
LOCK_FILE="/tmp/glossaria-deploy.lock"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar si ya hay un despliegue en curso
if [ -f "$LOCK_FILE" ]; then
    log "❌ Deploy already in progress. Exiting."
    exit 1
fi

# Crear lock file
touch "$LOCK_FILE"

# Cleanup function
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

cd "$REPO_DIR" || exit 1

log "🔄 Starting auto-deploy process..."

# Verificar cambios remotos
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "✅ No changes detected. Nothing to deploy."
    exit 0
fi

log "📥 New changes detected. Pulling updates..."

# Pull cambios
if ! git pull origin main; then
    log "❌ Git pull failed"
    exit 1
fi

log "✅ Git pull successful"

# Validar datos (opcional pero recomendado)
log "🔍 Validating data..."
if ! make validate; then
    log "❌ Data validation failed"
    exit 1
fi

log "✅ Data validation passed"

# Generar archivos JSON
log "⚙️ Generating JSON files..."
if ! make generate; then
    log "❌ JSON generation failed"
    exit 1
fi

log "✅ JSON files generated"

# Build del sitio (si usas build estático)
log "🏗️ Building site..."
if ! make build-prod; then
    log "❌ Site build failed"
    exit 1
fi

log "✅ Site built successfully"

# Opcional: reiniciar servidor web si es necesario
# systemctl reload nginx

log "🚀 Deploy completed successfully!"