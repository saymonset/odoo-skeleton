 #!/bin/bash
# backup/restore_full.sh - Script de restauración integral
set -e

# 1. Configuración
BACKUP_BASE_DIR="./backup/out"
ENV_FILE="./.env"
MAIN_DB_CONTAINER="odoo-db18-n8n"
CHATWOOT_DB_CONTAINER="chatwoot-db"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# 2. Determinar backup a restaurar
if [ -z "$1" ]; then
    BACKUP_DIR=$(ls -td $BACKUP_BASE_DIR/backup_* 2>/dev/null | head -1)
else
    BACKUP_DIR=$(readlink -f "$1")
fi

if [ ! -d "$BACKUP_DIR" ]; then
    error "No se encontró el directorio de backup: $BACKUP_DIR"
fi

ABS_BACKUP_DIR=$(readlink -f "$BACKUP_DIR")

log "=========================================="
log "Iniciando Restauración Integral"
log "=========================================="
log "📂 Backup origen: $BACKUP_DIR"

read -p "¿Desea continuar con la restauración? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restauración cancelada."
    exit 0
fi

# 3. Detener servicios
log "⏳ Deteniendo servicios..."
docker compose stop web n8n postiz chatwoot-app chatwoot-sidekiq 2>/dev/null || true

# ---------------------------------------------------------
# A. RESTAURAR BASES DE DATOS
# ---------------------------------------------------------
DATABASES=("dbodoo18" "db_n8n")
for DB in "${DATABASES[@]}"; do
    DUMP_FILE=$(ls $BACKUP_DIR/${DB}_*.dump 2>/dev/null | head -1)
    if [ -f "$DUMP_FILE" ]; then
        log "📦 Restaurando base de datos: $DB..."
        docker exec $MAIN_DB_CONTAINER psql -U odoo -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB';" 2>/dev/null || true
        docker exec $MAIN_DB_CONTAINER dropdb -U odoo --if-exists "$DB" 2>/dev/null || true
        docker exec $MAIN_DB_CONTAINER createdb -U odoo "$DB" 2>/dev/null || true
        docker exec -i $MAIN_DB_CONTAINER pg_restore -U odoo -d "$DB" < "$DUMP_FILE" 2>/dev/null || true
        log "   ✅ $DB restaurada"
    fi
done

DUMP_CW=$(ls $BACKUP_DIR/chatwoot_db_*.dump 2>/dev/null | head -1)
if [ -f "$DUMP_CW" ]; then
    log "📦 Restaurando base de datos: Chatwoot..."
    docker exec $CHATWOOT_DB_CONTAINER psql -U chatwoot -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='chatwoot_production';" 2>/dev/null || true
    docker exec $CHATWOOT_DB_CONTAINER dropdb -U chatwoot --if-exists "chatwoot_production" 2>/dev/null || true
    docker exec $CHATWOOT_DB_CONTAINER createdb -U chatwoot "chatwoot_production" 2>/dev/null || true
    docker exec -i $CHATWOOT_DB_CONTAINER pg_restore -U chatwoot -d "chatwoot_production" < "$DUMP_CW" 2>/dev/null || true
    log "   ✅ Chatwoot restaurada"
fi

# ---------------------------------------------------------
# C. RESTAURAR ARCHIVOS (Usando Docker)
# ---------------------------------------------------------
restore_folder() {
    local label=$1
    local file_pattern=$2
    local dest_subpath=$3
    local tar_file=$(ls $BACKUP_DIR/$file_pattern 2>/dev/null | head -1)
    local abs_tar=$(readlink -f "$tar_file")
    
    if [ -f "$tar_file" ]; then
        log "📁 Restaurando archivos: $label..."
        # Limpiar destino
        mkdir -p "$dest_subpath"
        # Usar Docker para extraer con los permisos correctos en el destino (visto desde el host)
        docker run --rm \
            -v "$(pwd)/$dest_subpath:/dest" \
            -v "$abs_tar:/backup.tar.gz:ro" \
            alpine sh -c "rm -rf /dest/* && tar -xzf /backup.tar.gz -C /dest"
        log "   ✅ $label restaurado"
    fi
}

restore_folder "Odoo Data" "odoo_data_*.tar.gz" "v18/data"
restore_folder "n8n Data" "n8n_data_*.tar.gz" "v18/n8n_data"
# restore_folder "Postiz Data" "postiz_data_*.tar.gz" "v18/postiz_uploads"
restore_folder "Chatwoot Data" "chatwoot_data_*.tar.gz" "v18/chatwoot_storage"

# ---------------------------------------------------------
# D. CLAVES Y PERMISOS
# ---------------------------------------------------------
KEY_FILE=$(ls $BACKUP_DIR/n8n_encryption_key_*.key 2>/dev/null | head -1)
if [ -f "$KEY_FILE" ]; then
    KEY=$(cat "$KEY_FILE")
    echo "$KEY" > secrets/n8n_encryption_key.txt
    mkdir -p ./v18/n8n_data
    echo "{\"encryptionKey\":\"$KEY\"}" > ./v18/n8n_data/config
fi

log "🚀 Reiniciando servicios..."
docker compose up -d

log "=========================================="
log "✅ RESTAURACIÓN COMPLETADA"
log "=========================================="
