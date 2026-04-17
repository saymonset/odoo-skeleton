#!/bin/bash
# 9_6_reset_chat_woot.sh - Resetea Chatwoot correctamente

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

log "=========================================="
log "Reseteando Chatwoot"
log "=========================================="

# 1. Detener Chatwoot (usando docker-compose.yaml principal)
log "1. Deteniendo Chatwoot..."
docker compose -f docker-compose.yaml down chatwoot-app chatwoot-sidekiq chatwoot-postgres 2>/dev/null || true
docker stop chatwoot-app chatwoot-sidekiq chatwoot-db 2>/dev/null || true
docker rm chatwoot-app chatwoot-sidekiq chatwoot-db 2>/dev/null || true

# 2. Eliminar base de datos de Chatwoot
log "2. Eliminando base de datos..."
PGPASSWORD=$(docker exec odoo-db18-n8n cat /run/secrets/postgres_password 2>/dev/null)
if [ -z "$PGPASSWORD" ]; then
    error "No se pudo obtener la contraseña de PostgreSQL"
fi

# Terminar conexiones activas
docker exec -e PGPASSWORD=$PGPASSWORD odoo-db18-n8n psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'chatwoot_production';" 2>/dev/null || true

# Eliminar la base de datos
docker exec -e PGPASSWORD=$PGPASSWORD odoo-db18-n8n psql -U postgres -c "DROP DATABASE IF EXISTS chatwoot_production;" 2>/dev/null || true

# Crear la base de datos nuevamente
docker exec -e PGPASSWORD=$PGPASSWORD odoo-db18-n8n psql -U postgres -c "CREATE DATABASE chatwoot_production OWNER chatwoot;" 2>/dev/null || true
log "✅ Base de datos recreada"

# 3. Limpiar volúmenes y archivos temporales
log "3. Limpiando archivos temporales..."
sudo rm -rf ./v18/chatwoot_tmp/* ./v18/chatwoot_logs/* ./v18/chatwoot_storage/* 2>/dev/null || true
mkdir -p ./v18/chatwoot_tmp ./v18/chatwoot_logs ./v18/chatwoot_storage
sudo chown -R 1000:1000 ./v18/chatwoot_tmp ./v18/chatwoot_logs ./v18/chatwoot_storage

# 4. Iniciar Chatwoot (usando docker-compose.yaml principal)
log "4. Iniciando Chatwoot..."
docker compose -f docker-compose.yaml up -d chatwoot-postgres chatwoot-app chatwoot-sidekiq

# 5. Esperar
log "5. Esperando a que Chatwoot inicie (esto puede tomar varios minutos)..."
sleep 45

# 6. Verificar
log "6. Verificando estado..."
if docker ps | grep -q chatwoot-app; then
    log "✅ Chatwoot app está corriendo"
else
    warn "⚠️ Chatwoot app no está corriendo"
    docker logs chatwoot-app --tail=20
fi

if docker ps | grep -q chatwoot-sidekiq; then
    log "✅ Chatwoot sidekiq está corriendo"
else
    warn "⚠️ Chatwoot sidekiq no está corriendo"
    docker logs chatwoot-sidekiq --tail=20
fi

# 7. Probar acceso
log "7. Probando acceso..."
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
    log "✅ Chatwoot responde correctamente (HTTP $HTTP_CODE)"
    log "🌐 Accede a http://localhost:3000 para completar la configuración inicial"
else
    warn "⚠️ Chatwoot responde con HTTP $HTTP_CODE"
    docker logs chatwoot-app --tail=30
fi

log "=========================================="
log "✅ Reset completado"
log "=========================================="