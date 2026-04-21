#!/bin/bash
# ==============================================================================
# 10_full_backup.sh
# Backup completo de TODO el sistema (Odoo + n8n + Base de Datos Compartida)
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

# Configuración
DATE=$(date +'%Y%m%d_%H%M%S')
BACKUP_DIR="backups/archive/$DATE"
DB_NAME="dbodoo18"
PG_PASSWORD=$(cat secrets/postgres_password.txt 2>/dev/null || echo "123456")

echo "===================================================="
echo "   INICIANDO BACKUP COMPLETO (ODOO + n8n)"
echo "===================================================="

# 1. Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# 2. Backup de Base de Datos (Compartida Odoo + n8n)
log "1. Realizando dump de la base de datos '$DB_NAME'..."
docker exec -e PGPASSWORD=$PG_PASSWORD odoo-db18-n8n pg_dump -U odoo -F c $DB_NAME > "$BACKUP_DIR/database_shared.dump"

# 3. Backup de Archivos Odoo (Filestore)
log "2. Comprimiendo filestore de Odoo..."
tar -czf "$BACKUP_DIR/odoo_filestore.tar.gz" -C v18/filestore .

# 4. Backup de Datos de n8n
log "3. Comprimiendo datos de n8n..."
tar -czf "$BACKUP_DIR/n8n_data.tar.gz" -C v18/n8n_data .

# 5. Backup de Configuraciones (Postiz, Temporal, etc.)
log "4. Respaldando configuraciones del sistema..."
cp .env "$BACKUP_DIR/.env.backup"
tar -czf "$BACKUP_DIR/config_v18.tar.gz" -C v18 config postiz_config 2>/dev/null || true

# 6. Resumen
log "===================================================="
log "✅ Backup completado con éxito."
info "Ubicación: $BACKUP_DIR/"
ls -lh "$BACKUP_DIR"
log "===================================================="
