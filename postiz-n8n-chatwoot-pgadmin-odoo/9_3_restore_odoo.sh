#!/bin/bash
# 9_3_restore_odoo.sh - Restaura backup de Odoo

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# ============================================
# CONFIGURACIÓN
# ============================================
BACKUP_DIR="/home/odoo/odoo-skeleton/postiz-n8n-chatwoot-pgadmin-odoo/backup/out"
DB_CONTAINER="odoo-db18-n8n"
WEB_CONTAINER="odoo-18-web"
DB_NAME="dbodoo18"
DB_USER="odoo"

# Archivos del backup
SQL_FILE="$BACKUP_DIR/backup.sql"
DATA_DIR="$BACKUP_DIR/data"

# Verificar que existe
if [ ! -f "$SQL_FILE" ]; then
    error "No se encuentra $SQL_FILE"
fi

log "=========================================="
log "Restaurando Odoo"
log "=========================================="
log "📂 Archivo SQL: $SQL_FILE"
log "📏 Tamaño: $(du -h $SQL_FILE | cut -f1)"

# 1. Detener Odoo
log "1. Deteniendo Odoo..."
docker stop $WEB_CONTAINER 2>/dev/null || true

# 2. Obtener contraseña
PGPASSWORD=$(docker exec $DB_CONTAINER cat /run/secrets/postgres_password 2>/dev/null || echo "odoo123")

# 3. Forzar eliminación de la base de datos
log "2. Terminando conexiones activas a la base de datos..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';" 2>/dev/null || true

log "3. Eliminando base de datos existente..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true

log "4. Creando nueva base de datos..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

log "5. Restaurando backup.sql (esto puede tomar varios minutos)..."
docker exec -i -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$SQL_FILE"

if [ $? -eq 0 ]; then
    log "✅ Base de datos restaurada correctamente"
else
    warn "⚠️ Algunas advertencias durante la restauración (normales)"
fi

# 4. Restaurar filestore
FILESTORE_DIR="$DATA_DIR/filestore"
if [ -d "$FILESTORE_DIR" ] && [ "$(ls -A $FILESTORE_DIR 2>/dev/null)" ]; then
    log "6. Restaurando filestore..."
    sudo rm -rf ./v18/filestore/*
    sudo cp -r "$FILESTORE_DIR"/* ./v18/filestore/ 2>/dev/null || true
    sudo chown -R 1001:1001 ./v18/filestore
    log "✅ Filestore restaurado"
else
    warn "⚠️ No se encontró filestore para restaurar"
fi

# 5. Restaurar addons
ADDONS_DIR="$DATA_DIR/addons"
if [ -d "$ADDONS_DIR" ] && [ "$(ls -A $ADDONS_DIR 2>/dev/null)" ]; then
    log "7. Restaurando addons..."
    sudo rm -rf ./v18/addons/extra/* ./v18/addons/oca/* ./v18/addons/enterprise/* 2>/dev/null || true
    sudo cp -r "$ADDONS_DIR"/* ./v18/addons/ 2>/dev/null || true
    sudo chown -R 1001:1001 ./v18/addons
    log "✅ Addons restaurados"
else
    warn "⚠️ No se encontraron addons para restaurar"
fi

# 6. Actualizar referencias al filestore
log "8. Actualizando referencias al filestore..."
docker exec -e PGPASSWORD=$PGPASSWORD $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \
    "UPDATE ir_attachment SET store_fname = REPLACE(store_fname, 'dbintegraia_18', '$DB_NAME') WHERE store_fname LIKE '%dbintegraia_18%';" 2>/dev/null || true

# 7. Ajustar permisos
log "9. Ajustando permisos..."
sudo chown -R 1001:1001 ./v18/odoo-web-data ./v18/logs ./v18/filestore 2>/dev/null || true
sudo chmod -R 755 ./v18/odoo-web-data ./v18/logs ./v18/filestore 2>/dev/null || true

# 8. Iniciar Odoo
log "10. Iniciando Odoo..."
docker start $WEB_CONTAINER

# 9. Verificar
log "11. Verificando estado..."
sleep 15

if docker ps | grep -q $WEB_CONTAINER; then
    log "✅ Odoo está corriendo"
    log ""
    log "📋 Últimos logs de Odoo:"
    docker logs $WEB_CONTAINER --tail=20
else
    warn "⚠️ Odoo no está corriendo. Verificando logs..."
    docker logs $WEB_CONTAINER --tail=30
fi

# 10. Probar acceso
log "12. Probando acceso HTTP..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:18069 2>/dev/null | grep -q "200\|301\|302\|303"; then
    log "✅ Odoo responde en http://localhost:18069"
else
    warn "⚠️ Odoo aún no responde (puede estar iniciando)"
fi

log "=========================================="
log "✅ RESTAURACIÓN COMPLETADA"
log "=========================================="
log "🌐 Accede a Odoo: http://localhost:18069"
log "👤 Usuario: admin"
log "=========================================="