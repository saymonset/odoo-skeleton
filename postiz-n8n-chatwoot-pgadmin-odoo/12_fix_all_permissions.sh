#!/bin/bash
# ==============================================================================
# 12_fix_all_permissions.sh
# Corrección maestra de permisos para todo el stack (Odoo, n8n, Postgres, etc.)
# ==============================================================================

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Directorio base
BASE_DIR="v18"

echo "===================================================="
echo "   CORRECCIÓN DE PERMISOS (UID/GID) - MASTER"
echo "===================================================="

if [ ! -d "$BASE_DIR" ]; then
    echo "❌ Error: Directorio $BASE_DIR no encontrado."
    exit 1
fi

# 0. Secrets y Directorio Base
log "Configurando secrets y directorio base..."
chmod 755 .
chown odoo:odoo secrets/ secrets/*.txt 2>/dev/null
chmod 750 secrets/
chmod 640 secrets/*.txt 2>/dev/null

# 1. Odoo (UID 1001)
log "Aplicando permisos para Odoo (UID 1001)..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 1001:1001 /v18/filestore /v18/odoo-web-data /v18/logs /v18/addons /v18/backups
    chmod -R 775 /v18/filestore /v18/odoo-web-data /v18/logs /v18/addons /v18/backups
"

# 2. n8n y Elasticsearch (UID 1000)
log "Aplicando permisos para n8n y Elasticsearch (UID 1000)..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 1000:1000 /v18/n8n_data /v18/temporal_elasticsearch_data /v18/n8n_node_modules
    chmod -R 775 /v18/n8n_data /v18/temporal_elasticsearch_data /v18/n8n_node_modules
"

# 3. PostgreSQL (UID 999)
log "Aplicando permisos para PostgreSQL (UID 999)..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 999:999 /v18/pgdata /v18/chatwoot_pgdata
    chmod -R 700 /v18/pgdata /v18/chatwoot_pgdata
"

# 4. Chatwoot y Redis (UID 1001 / alpine-redis)
log "Aplicando permisos para Chatwoot y Redis (UID 1001)..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 1001:1001 /v18/chatwoot_storage /v18/chatwoot_redis_data /v18/chatwoot_logs /v18/chatwoot_overrides
    chmod -R 775 /v18/chatwoot_storage /v18/chatwoot_redis_data /v18/chatwoot_logs /v18/chatwoot_overrides
"

# 5. pgAdmin (UID 5050)
log "Aplicando permisos para pgAdmin (UID 5050)..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 5050:5050 /v18/pgadmin-data
    chmod -R 775 /v18/pgadmin-data
"

# 6. Postiz Config
log "Aplicando permisos para Postiz..."
docker run --rm -v "$(pwd)/$BASE_DIR":/v18 alpine sh -c "
    chown -R 1000:1000 /v18/postiz_config /v18/postiz_uploads
    chmod -R 775 /v18/postiz_config /v18/postiz_uploads
"

log "===================================================="
log "✅ Todos los permisos han sido corregidos."
log "===================================================="
