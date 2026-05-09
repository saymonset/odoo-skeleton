#!/bin/bash
# backup/restore_solo_n8n.sh - Script de restauración solo para n8n
set -e

# 1. Configuración
BACKUP_BASE_DIR="./backup/out"
ENV_FILE="./.env"
MAIN_DB_CONTAINER="odoo-db18-n8n"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
log "Iniciando Restauración SOLO n8n"
log "=========================================="
log "📂 Backup origen: $BACKUP_DIR"

read -p "¿Desea continuar con la restauración de n8n? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restauración cancelada."
    exit 0
fi

# 3. Detener servicio n8n
log "⏳ Deteniendo servicio n8n..."
docker compose stop n8n 2>/dev/null || true

# ---------------------------------------------------------
# A. RESTAURAR BASE DE DATOS
# ---------------------------------------------------------
DB="db_n8n"
DUMP_FILE=$(ls $BACKUP_DIR/${DB}_*.dump 2>/dev/null | head -1)
if [ -f "$DUMP_FILE" ]; then
    log "📦 Restaurando base de datos: $DB..."
    docker exec $MAIN_DB_CONTAINER psql -U odoo -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB';" 2>/dev/null || true
    docker exec $MAIN_DB_CONTAINER dropdb -U odoo --if-exists "$DB" 2>/dev/null || true
    docker exec $MAIN_DB_CONTAINER createdb -U odoo "$DB" 2>/dev/null || true
    docker exec -i $MAIN_DB_CONTAINER pg_restore -U odoo -d "$DB" < "$DUMP_FILE" 2>/dev/null || true
    log "   ✅ $DB restaurada"
else
    warn "   ⚠️ No se encontró backup de la base de datos de n8n en este directorio."
fi

# ---------------------------------------------------------
# B. RESTAURAR ARCHIVOS
# ---------------------------------------------------------
restore_folder() {
    local label=$1
    local file_pattern=$2
    local dest_subpath=$3
    local tar_file=$(ls $BACKUP_DIR/$file_pattern 2>/dev/null | head -1)
    
    if [ -f "$tar_file" ]; then
        local abs_tar=$(readlink -f "$tar_file")
        log "📁 Restaurando archivos: $label..."
        # Limpiar destino
        mkdir -p "$dest_subpath"
        # Usar Docker para extraer con los permisos correctos en el destino (visto desde el host)
        docker run --rm \
            -v "$(pwd)/$dest_subpath:/dest" \
            -v "$abs_tar:/backup.tar.gz:ro" \
            alpine sh -c "rm -rf /dest/* && tar -xzf /backup.tar.gz -C /dest"
        log "   ✅ $label restaurado"
    else
        warn "   ⚠️ No se encontró backup de archivos para $label."
    fi
}

restore_folder "n8n Data" "n8n_data_*.tar.gz" "v18/n8n_data"

# ---------------------------------------------------------
# C. RESTAURAR CLAVE DE ENCRIPTACIÓN
# ---------------------------------------------------------
KEY_FILE=$(ls $BACKUP_DIR/n8n_encryption_key_*.key 2>/dev/null | head -1)
if [ -f "$KEY_FILE" ]; then
    log "🔑 Restaurando clave de encriptación de n8n..."
    KEY=$(cat "$KEY_FILE")
    mkdir -p secrets
    echo "$KEY" > secrets/n8n_encryption_key.txt
    mkdir -p ./v18/n8n_data
    echo "{\"encryptionKey\":\"$KEY\"}" > ./v18/n8n_data/config
    log "   ✅ Clave de encriptación restaurada"
fi

# ---------------------------------------------------------
# D. REINICIAR
# ---------------------------------------------------------
log "🚀 Reiniciando servicio n8n..."
docker compose up -d n8n

log "=========================================="
log "✅ RESTAURACIÓN DE n8n COMPLETADA"
log "=========================================="
