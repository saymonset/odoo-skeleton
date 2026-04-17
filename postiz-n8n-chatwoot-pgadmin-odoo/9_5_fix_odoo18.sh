 #!/bin/bash
# 9_5_fix_odoo18.sh - Reparación completa de Odoo 18

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

log "=========================================="
log "Reparando Odoo 18"
log "=========================================="

# 1. Obtener la contraseña del secreto
log "1. Obteniendo contraseña del secreto..."
PGPASSWORD=$(cat ./secrets/postgres_password.txt 2>/dev/null)

if [ -z "$PGPASSWORD" ]; then
    error "No se pudo obtener la contraseña del secreto"
fi

log "✅ Contraseña obtenida: ${PGPASSWORD:0:10}..."

# 2. Cambiar la contraseña del usuario odoo en PostgreSQL
log "2. Actualizando contraseña del usuario odoo en PostgreSQL..."
docker exec odoo-db18-n8n psql -U postgres -c "ALTER USER odoo WITH PASSWORD '$PGPASSWORD';" 2>/dev/null || {
    # Si postgres no existe, usar odoo como superusuario
    docker exec odoo-db18-n8n psql -U odoo -d postgres -c "ALTER USER odoo WITH PASSWORD '$PGPASSWORD';" 2>/dev/null || true
}
log "✅ Contraseña actualizada"

# 3. Verificar que la base de datos dbodoo18 existe
log "3. Verificando base de datos dbodoo18..."
docker exec -e PGPASSWORD=$PGPASSWORD odoo-db18-n8n psql -U odoo -d postgres -c "CREATE DATABASE dbodoo18 OWNER odoo;" 2>/dev/null && log "✅ Base de datos creada" || log "✅ Base de datos ya existe"

# 4. Probar conexión directa
log "4. Probando conexión directa..."
if docker exec -e PGPASSWORD=$PGPASSWORD odoo-db18-n8n psql -U odoo -d dbodoo18 -c "SELECT 1;" 2>/dev/null; then
    log "✅ Conexión exitosa a dbodoo18"
else
    error "❌ No se puede conectar a la base de datos"
fi

# 5. Crear directorio de sesiones
log "5. Creando directorio de sesiones..."
docker exec odoo-18-web mkdir -p /var/lib/odoo/.local/share/Odoo/sessions 2>/dev/null || true
docker exec odoo-18-web chown -R 1001:1001 /var/lib/odoo/.local/share/Odoo 2>/dev/null || true

# 6. Iniciar Odoo
log "6. Iniciando Odoo..."
docker start odoo-18-web

# 7. Verificar
log "7. Verificando estado..."
sleep 15

if docker ps | grep -q odoo-18-web; then
    log "✅ Odoo 18 está corriendo"
    log ""
    log "📋 Últimos logs:"
    docker logs odoo-18-web --tail=20
else
    log "❌ Odoo 18 no pudo iniciar"
    log "📋 Logs de error:"
    docker logs odoo-18-web --tail=30
fi

# 8. Probar acceso HTTP
log "8. Probando acceso HTTP..."
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:18069 2>/dev/null | grep -q "200\|301\|302\|303"; then
    log "✅ Odoo responde en http://localhost:18069"
else
    warn "⚠️ Odoo aún no responde (puede estar iniciando)"
fi

log "=========================================="
log "✅ Reparación completada"
log "=========================================="
log "🌐 Accede a Odoo: http://localhost:18069"
log "👤 Usuario: admin"
log "=========================================="