 #!/bin/bash
# backup/backup.sh - Script de backup unificado para IntegraIA (Odoo, n8n, Postiz, Chatwoot)
set -e

# 1. Cargar configuración
ODOO_CONF="./v18/config/odoo.conf"
ENV_FILE="./.env"

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' $ENV_FILE | xargs)
fi

# Leer variables de odoo.conf si existe
if [ -f "$ODOO_CONF" ]; then
    DB_NAME_ODOO=$(grep -E '^db_name\s*=' "$ODOO_CONF" | awk -F '=' '{print $2}' | tr -d ' ' | tr -d '\r')
    DB_USER_ODOO=$(grep -E '^db_user\s*=' "$ODOO_CONF" | awk -F '=' '{print $2}' | tr -d ' ' | tr -d '\r')
fi

# Valores por defecto
DB_NAME_ODOO=${DB_NAME_ODOO:-dbodoo18}
DB_USER_ODOO=${DB_USER_ODOO:-odoo}
MAIN_DB_CONTAINER="odoo-db18-n8n"
CHATWOOT_DB_CONTAINER="chatwoot-db"

# Directorio de backup
BACKUP_BASE_DIR="./backup/out"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$DATE"
ABS_BACKUP_DIR=$(readlink -f "$BACKUP_DIR")
RETENTION_DAYS=7

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

log "=========================================="
log "Iniciando Backup del Sistema Completo - $DATE"
log "=========================================="
log "📂 Destino: $BACKUP_DIR"

# ---------------------------------------------------------
# A. BACKUP DE BASES DE DATOS
# ---------------------------------------------------------
DATABASES=("dbodoo18" "db_n8n" "postiz")

for DB in "${DATABASES[@]}"; do
    log "📦 Backup de base de datos: $DB..."
    if docker exec $MAIN_DB_CONTAINER pg_dump -U odoo -d "$DB" -F c > "$BACKUP_DIR/${DB}_${DATE}.dump" 2>/dev/null; then
        SIZE=$(du -sh "$BACKUP_DIR/${DB}_${DATE}.dump" | cut -f1)
        log "   ✅ $DB respaldada ($SIZE)"
    else
        warn "   ⚠️ No se pudo respaldar $DB"
        rm -f "$BACKUP_DIR/${DB}_${DATE}.dump"
    fi
done

log "📦 Backup de base de datos: Chatwoot..."
if docker exec $CHATWOOT_DB_CONTAINER pg_dump -U chatwoot -d chatwoot_production -F c > "$BACKUP_DIR/chatwoot_db_${DATE}.dump" 2>/dev/null; then
    SIZE=$(du -sh "$BACKUP_DIR/chatwoot_db_${DATE}.dump" | cut -f1)
    log "   ✅ Chatwoot respaldada ($SIZE)"
else
    warn "   ⚠️ No se pudo respaldar Chatwoot"
fi

# ---------------------------------------------------------
# C. BACKUP DE ARCHIVOS (Usando Docker para evitar problemas de permisos)
# ---------------------------------------------------------

backup_folder() {
    local label=$1
    local src_path=$2
    local output_name=$3
    
    log "📁 Respaldando archivos: $label..."
    if [ -d "$src_path" ]; then
        # Usamos un contenedor temporal para hacer el tar y que no nos frene el permiso local
        docker run --rm \
            -v "$(pwd)/$src_path:/source:ro" \
            -v "$ABS_BACKUP_DIR:/backup" \
            alpine tar -czf "/backup/$output_name" -C /source .
        log "   ✅ $label respaldado"
    else
        warn "   ⚠️ Directorio no encontrado: $src_path"
    fi
}

backup_folder "Odoo Data" "v18/data" "odoo_data_${DATE}.tar.gz"
backup_folder "n8n Data" "v18/n8n_data" "n8n_data_${DATE}.tar.gz"
backup_folder "Postiz Data" "v18/postiz_uploads" "postiz_data_${DATE}.tar.gz"
backup_folder "Chatwoot Data" "v18/chatwoot_storage" "chatwoot_data_${DATE}.tar.gz"

# ---------------------------------------------------------
# D. CONFIGURACIÓN Y CLAVES
# ---------------------------------------------------------
log "🔑 Respaldando configuración y claves..."
[ -f "./.env" ] && cp ./.env "$BACKUP_DIR/env_file_${DATE}.env"
[ -f "./v18/config/odoo.conf" ] && cp ./v18/config/odoo.conf "$BACKUP_DIR/odoo_config_${DATE}.conf"

if [ -d "./v18/n8n_data" ] && [ -f "./v18/n8n_data/config" ]; then
    ENCRYPTION_KEY=$(grep -o '"encryptionKey":"[^"]*"' "./v18/n8n_data/config" | cut -d'"' -f4)
    [ -n "$ENCRYPTION_KEY" ] && echo "$ENCRYPTION_KEY" > "$BACKUP_DIR/n8n_encryption_key_${DATE}.key"
fi

# ---------------------------------------------------------
# E. METADATOS Y LIMPIEZA
# ---------------------------------------------------------
cat > "$BACKUP_DIR/backup_metadata.txt" << EOF
INTEGRAIA FULL BACKUP - $DATE
EOF

find "$BACKUP_BASE_DIR" -type d -name "backup_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

log "=========================================="
log "✅ BACKUP COMPLETADO EXITOSAMENTE"
log "📁 Ubicación: $BACKUP_DIR"
log "=========================================="