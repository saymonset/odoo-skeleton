#!/bin/bash
# 9_6_fix_n8n_final.sh - Solución definitiva para n8n

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }

log "=========================================="
log "Arreglando n8n - Solución definitiva"
log "=========================================="

# Clave correcta
KEY="874eca07f4fe0a551b4c004843c91dc0c4a41f520687baaf40b4c64218c322a06b105d4e4e920e8fc3e8b5d70ccf696e1841d71a8028975f379754962de73b98"

# 1. Detener y eliminar contenedor
log "1. Eliminando contenedor actual..."
docker rm -f n8n-container 2>/dev/null || true

# 2. Limpiar volumen
log "2. Limpiando volumen..."
docker run --rm -v n8n_data:/data alpine sh -c "rm -rf /data/* && echo '{\"encryptionKey\":\"$KEY\"}' > /data/config"

# 3. Crear config local
log "3. Creando config local..."
mkdir -p ./v18/n8n_data
echo "{\"encryptionKey\":\"$KEY\"}" > ./v18/n8n_data/config
chown -R 1000:1000 ./v18/n8n_data 2>/dev/null || true

# 4. Modificar docker-compose.n8n.yml para usar la clave directa (NO archivo)
log "4. Modificando docker-compose.n8n.yml..."
cp docker-compose.n8n.yml docker-compose.n8n.yml.backup
sed -i 's|- N8N_ENCRYPTION_KEY_FILE=/run/secrets/n8n_encryption_key|- N8N_ENCRYPTION_KEY='"$KEY"'|' docker-compose.n8n.yml
sed -i '/- n8n_encryption_key/d' docker-compose.n8n.yml

# 5. Recrear n8n usando docker-compose.yaml principal
log "5. Recreando n8n usando docker-compose.yaml..."
docker compose -f docker-compose.yaml up -d n8n

# 6. Verificar
log "6. Verificando estado..."
sleep 15

if docker ps | grep -q n8n-container; then
    log "✅ n8n está corriendo"
    log ""
    log "📋 Últimos logs:"
    docker logs n8n-container --tail=20
else
    log "❌ n8n no pudo iniciar"
    docker logs n8n-container --tail=30
fi

log "=========================================="
log "✅ Reparación completada"
log "=========================================="
log "🌐 Accede a n8n: http://localhost:5678"
log "=========================================="