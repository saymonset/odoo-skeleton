#!/bin/bash
# backup_n8n/backup.sh - Script interno de backup

set -e

# Configuración
N8N_CONTAINER="n8n-container"
N8N_DATA_DIR="./v18/n8n_data"
BACKUP_BASE_DIR="./backup_n8n/out"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_n8n_$DATE"
RETENTION_DAYS=7

# Configuración de base de datos
DB_NAME="db_n8n"
DB_USER="odoo"
DB_CONTAINER="odoo-db18-n8n"

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
mkdir -p $BACKUP_DIR

log "=========================================="
log "Iniciando Backup n8n - $DATE"
log "=========================================="
log "📂 Backup destino: $BACKUP_DIR"

# 1. Backup de base de datos
log "📦 Backup de base de datos n8n..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c > "$BACKUP_DIR/n8n_db_${DATE}.dump"

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_db_${DATE}.dump" | cut -f1)
    log "✅ Base de datos respaldada: n8n_db_${DATE}.dump ($SIZE)"
else
    error "❌ Falló el backup de la base de datos"
    exit 1
fi

# 2. Backup de workflows (SQL readable)
log "📋 Exportando workflows como SQL..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -t workflow_entity -t shared_workflow --data-only --column-inserts > "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" 2>/dev/null || true

if [ -f "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" | cut -f1)
    log "✅ Workflows exportados ($SIZE)"
fi

# 3. Backup de credenciales
log "🔐 Exportando credenciales..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -t credentials_entity --data-only --column-inserts > "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" 2>/dev/null || true

if [ -f "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" | cut -f1)
    log "✅ Credenciales exportadas ($SIZE)"
fi

# 4. Backup de archivos de n8n
log "📁 Backup de archivos n8n..."
if [ -d "$N8N_DATA_DIR" ]; then
    tar -czf "$BACKUP_DIR/n8n_files_${DATE}.tar.gz" -C ./v18 n8n_data --exclude="n8n_data/.cache" --exclude="n8n_data/tmp" 2>/dev/null
    SIZE=$(du -sh "$BACKUP_DIR/n8n_files_${DATE}.tar.gz" | cut -f1)
    log "✅ Archivos respaldados ($SIZE)"
else
    warn "⚠️ No se encontró directorio de datos n8n"
fi

# 5. Backup de configuración y clave de encriptación (¡CRÍTICO!)
log "🔑 Respaldando configuración y clave de encriptación..."
if [ -f "$N8N_DATA_DIR/config" ]; then
    # Copiar configuración completa
    cp "$N8N_DATA_DIR/config" "$BACKUP_DIR/n8n_config_${DATE}.json"
    
    # Extraer y guardar SOLO la clave por separado (para fácil restauración)
    ENCRYPTION_KEY=$(grep -o '"encryptionKey":"[^"]*"' "$N8N_DATA_DIR/config" | cut -d'"' -f4)
    if [ -n "$ENCRYPTION_KEY" ]; then
        echo "$ENCRYPTION_KEY" > "$BACKUP_DIR/n8n_encryption_key_${DATE}.key"
        log "✅ Clave de encriptación guardada por separado"
        log "🔐 Clave: ${ENCRYPTION_KEY:0:32}..."
    fi
fi

# 6. Respaldar también el archivo secreto actual
if [ -f "secrets/n8n_encryption_key.txt" ]; then
    cp "secrets/n8n_encryption_key.txt" "$BACKUP_DIR/n8n_encryption_key_secret_${DATE}.txt"
    log "✅ Archivo secreto respaldado"
fi

# 7. Exportar lista de workflows
log "📝 Generando lista de workflows..."
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT id, name, created_at, updated_at FROM workflow_entity ORDER BY id;" 2>/dev/null > "$BACKUP_DIR/workflows_list_${DATE}.txt" || echo "No se pudo generar lista" > "$BACKUP_DIR/workflows_list_${DATE}.txt"

# 8. Crear archivo de metadatos
log "📝 Creando metadatos del backup..."
cat > "$BACKUP_DIR/backup_metadata_${DATE}.txt" << EOF
n8n Backup Information
======================
Date: $DATE
Database: $DB_NAME
Database User: $DB_USER
Container: $N8N_CONTAINER
Backup Directory: $BACKUP_DIR

ENCRYPTION KEY (guardar en lugar seguro):
$(cat "$BACKUP_DIR/n8n_encryption_key_${DATE}.key" 2>/dev/null || echo "No se pudo extraer")

Files Generated:
$(ls -la $BACKUP_DIR | tail -n +4)

Retention Policy: $RETENTION_DAYS days

Quick Restore Commands:
-----------------------
./9_3_restore_n8n.sh -f $BACKUP_DIR/n8n_db_${DATE}.dump
EOF
log "✅ Metadatos guardados"

# 9. Limpiar backups antiguos
log "🧹 Eliminando backups con más de $RETENTION_DAYS días..."
find $BACKUP_BASE_DIR -type d -name "backup_n8n_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

# 10. Verificar integridad
log "🔍 Verificando integridad de backups..."
if [ -s "$BACKUP_DIR/n8n_db_${DATE}.dump" ]; then
    DB_SIZE=$(du -sh "$BACKUP_DIR/n8n_db_${DATE}.dump" | cut -f1)
    log "✅ Base de datos válida ($DB_SIZE)"
fi

# 11. Resumen final
log "=========================================="
log "✅ BACKUP DE N8N COMPLETADO"
log "=========================================="
log "📁 Ubicación: $BACKUP_DIR"
log "📦 Archivos generados:"
ls -lh $BACKUP_DIR/ | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'
log ""
log "📋 Tamaño total: $(du -sh $BACKUP_DIR | cut -f1)"
log ""
log "🔧 Para restaurar este backup:"
log "   ./9_3_restore_n8n.sh -f $BACKUP_DIR/n8n_db_${DATE}.dump"
log "=========================================="