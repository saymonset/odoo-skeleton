#!/bin/bash
# ==============================================================================
# 11_restore_full_system.sh
# Restauración completa de Odoo y n8n (Base de Datos Compartida + Archivos)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Configuración
DB_NAME="dbodoo18"
DB_USER="odoo"
PG_PASSWORD=$(cat secrets/postgres_password.txt 2>/dev/null || echo "123456")
BACKUP_SQL="backup/out/backup.sql"
ODOO_DATA_DIR="backup/out/data"
N8N_BACKUP_DIR="backup_n8n/out"

echo "===================================================="
echo "   RESTAURACIÓN COMPLETA ODOO + n8n (DB COMPARTIDA)"
echo "===================================================="

# 1. Verificación de archivos
if [ ! -f "$BACKUP_SQL" ]; then
    error "❌ No se encontró el archivo de backup SQL en $BACKUP_SQL"
    exit 1
fi

read -p "¿Estás seguro de que deseas borrar la DB actual y restaurar todo? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    warn "Operación cancelada."
    exit 0
fi

# 2. Detener servicios
log "1. Deteniendo contenedores de Odoo y n8n..."
docker stop odoo-18-web n8n-container

# 3. Recrear Base de Datos
log "2. Recreando base de datos $DB_NAME..."
docker exec -e PGPASSWORD=$PG_PASSWORD odoo-db18-n8n psql -U odoo -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';"
docker exec -e PGPASSWORD=$PG_PASSWORD odoo-db18-n8n psql -U odoo -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec -e PGPASSWORD=$PG_PASSWORD odoo-db18-n8n psql -U odoo -d postgres -c "CREATE DATABASE $DB_NAME OWNER odoo;"

# 4. Restaurar SQL
log "3. Cargando backup SQL principal (Odoo + n8n)..."
docker exec -i -e PGPASSWORD=$PG_PASSWORD odoo-db18-n8n psql -U odoo -d $DB_NAME < "$BACKUP_SQL"

# 5. Restaurar Archivos
log "4. Restaurando Filestore y n8n data..."
# Limpiar antiguos
docker run --rm -v "$(pwd):/work" alpine sh -c "rm -rf /work/v18/filestore/* /work/v18/n8n_data/*"

# Copiar filestore
if [ -d "$ODOO_DATA_DIR/filestore" ]; then
    log "  Copiando filestore de Odoo..."
    docker run --rm -v "$(pwd):/work" alpine cp -rp /work/$ODOO_DATA_DIR/filestore/. /work/v18/filestore/
else
    warn "  ⚠️ No se encontró filestore en la carpeta de backup."
fi

# Copiar n8n data
N8N_TAR=$(find $N8N_BACKUP_DIR -name "n8n_files_*.tar.gz" | head -n 1)
if [ -f "$N8N_TAR" ]; then
    log "  Extrayendo archivos de n8n desde $N8N_TAR..."
    docker run --rm -v "$(pwd):/work" alpine tar -xzf /work/$N8N_TAR -C /work/v18/n8n_data/
else
    warn "  ⚠️ No se encontró el archivo comprimido (.tar.gz) de n8n."
fi

# 6. Corregir permisos
log "5. Aplicando permisos correctos..."
./12_fix_all_permissions.sh

# 7. Iniciar servicios
log "6. Reiniciando contenedores..."
docker start odoo-18-web n8n-container

log "===================================================="
log "✅ Restauración completada con éxito."
log "===================================================="
