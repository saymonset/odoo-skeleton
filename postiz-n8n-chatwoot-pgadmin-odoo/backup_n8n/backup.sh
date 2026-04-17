#!/bin/bash
set -e

# Configuración
N8N_CONTAINER="n8n-container"
N8N_DATA_DIR="./v18/n8n_data"
BACKUP_BASE_DIR="./backup_n8n/out"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_n8n_$DATE"
RETENTION_DAYS=7

# Configuración de base de datos (desde docker-compose.n8n.yml)
DB_NAME="dbodoo18"
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
log "🗄️ Base de datos: $DB_NAME"
log "📁 n8n data dir: $N8N_DATA_DIR"

# 1. Backup de base de datos de n8n
log "📦 Backup de base de datos n8n..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c > "$BACKUP_DIR/n8n_db_${DATE}.dump"

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_db_${DATE}.dump" | cut -f1)
    log "✅ Base de datos respaldada: n8n_db_${DATE}.dump ($SIZE)"
else
    error "❌ Falló el backup de la base de datos"
    exit 1
fi

# 2. Backup de workflows (SQL export adicional para fácil acceso)
log "📋 Exportando workflows como SQL readable..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -t workflow_entity -t shared_workflow --data-only --column-inserts > "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" 2>/dev/null || true

if [ -f "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_workflows_only_${DATE}.sql" | cut -f1)
    log "✅ Workflows exportados: n8n_workflows_only_${DATE}.sql ($SIZE)"
fi

# 3. Backup de credenciales (SQL export)
log "🔐 Exportando credenciales..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -t credentials_entity --data-only --column-inserts > "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" 2>/dev/null || true

if [ -f "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" ]; then
    SIZE=$(du -sh "$BACKUP_DIR/n8n_credentials_only_${DATE}.sql" | cut -f1)
    log "✅ Credenciales exportadas: n8n_credentials_only_${DATE}.sql ($SIZE)"
fi

# 4. Backup de archivos de n8n (configuración, archivos estáticos)
log "📁 Backup de archivos n8n..."
if [ -d "$N8N_DATA_DIR" ]; then
    # Excluir directorios temporales o de cache si existen
    tar -czf "$BACKUP_DIR/n8n_files_${DATE}.tar.gz" --exclude="n8n_data/.cache" --exclude="n8n_data/tmp" -C ./v18 n8n_data 2>/dev/null || true
    SIZE=$(du -sh "$BACKUP_DIR/n8n_files_${DATE}.tar.gz" | cut -f1)
    log "✅ Archivos n8n respaldados: n8n_files_${DATE}.tar.gz ($SIZE)"
else
    warn "⚠️ No se encontró directorio de datos n8n"
fi

# 5. Backup de configuración de n8n (si existe archivo .json)
if [ -f "$N8N_DATA_DIR/config" ]; then
    cp "$N8N_DATA_DIR/config" "$BACKUP_DIR/n8n_config_${DATE}.json" 2>/dev/null
    log "✅ Configuración respaldada: n8n_config_${DATE}.json"
fi

# 6. Exportar lista de workflows con nombres (para documentación)
log "📝 Generando lista de workflows..."
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "SELECT id, name, created_at, updated_at FROM workflow_entity ORDER BY id;" 2>/dev/null > "$BACKUP_DIR/workflows_list_${DATE}.txt" || echo "No se pudo generar lista" > "$BACKUP_DIR/workflows_list_${DATE}.txt"

if [ -f "$BACKUP_DIR/workflows_list_${DATE}.txt" ]; then
    log "✅ Lista de workflows generada"
fi

# 7. Crear archivo de metadatos del backup
log "📝 Creando metadatos del backup..."
cat > "$BACKUP_DIR/backup_metadata_${DATE}.txt" << EOF
n8n Backup Information
======================
Date: $DATE
Database: $DB_NAME
Database User: $DB_USER
Container: $N8N_CONTAINER
Backup Directory: $BACKUP_DIR

Files Generated:
$(ls -la $BACKUP_DIR | tail -n +4)

Retention Policy: $RETENTION_DAYS days

Quick Restore Commands:
-----------------------
1. Restore database:
   docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME -c < backup_file.dump

2. Restore files:
   tar -xzf n8n_files_*.tar.gz -C ./v18/

3. Full restore (stop n8n first):
   docker stop $N8N_CONTAINER
   docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME -c < backup_file.dump
   rm -rf $N8N_DATA_DIR/*
   tar -xzf n8n_files_*.tar.gz -C ./v18/
   docker start $N8N_CONTAINER
EOF
log "✅ Metadatos guardados: backup_metadata_${DATE}.txt"

# 8. Limpiar backups antiguos
log "🧹 Eliminando backups con más de $RETENTION_DAYS días..."
find $BACKUP_BASE_DIR -type d -name "backup_n8n_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

# 9. Verificar integridad de backups
log "🔍 Verificando integridad de backups..."
DB_SIZE=$(du -sh "$BACKUP_DIR/n8n_db_${DATE}.dump" | cut -f1)
FILES_SIZE=$(du -sh "$BACKUP_DIR/n8n_files_${DATE}.tar.gz" | cut -f1)

# Verificar que el archivo dump no esté vacío
if [ -s "$BACKUP_DIR/n8n_db_${DATE}.dump" ]; then
    log "✅ Base de datos válida (tamaño: $DB_SIZE)"
else
    warn "⚠️ El backup de la base de datos parece estar vacío"
fi

# 10. Resumen final
log "=========================================="
log "✅ BACKUP DE N8N COMPLETADO"
log "=========================================="
log "📁 Ubicación: $BACKUP_DIR"
log "📦 Archivos generados:"
ls -lh $BACKUP_DIR/ | tail -n +2 | awk '{print "   - " $9 " (" $5 ")"}'
log ""
log "📋 Tamaño total del backup: $(du -sh $BACKUP_DIR | cut -f1)"
log ""
log "🔧 Para restaurar este backup, ejecuta:"
log "   ./9_3_restore_n8n.sh -f $BACKUP_DIR/n8n_db_${DATE}.dump"
log "=========================================="