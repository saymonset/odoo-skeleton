 #!/bin/bash
# 9_3_restore_n8n.sh

set -e

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

# Configuración
N8N_CONTAINER="n8n-container"
N8N_DATA_DIR="./v18/n8n_data"
DB_NAME="dbodoo18"
DB_USER="odoo"
DB_CONTAINER="odoo-db18-n8n"
BACKUP_BASE_DIR="./backup_n8n/out"

# Parsear argumentos
BACKUP_FILE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Uso: $0 -f <archivo_backup.dump>"
            echo ""
            echo "Opciones:"
            echo "  -f, --file    Archivo dump de base de datos a restaurar"
            echo "  -h, --help    Mostrar esta ayuda"
            exit 0
            ;;
        *)
            error "Opción desconocida: $1"
            ;;
    esac
done

if [ -z "$BACKUP_FILE" ]; then
    error "Debe especificar el archivo de backup con -f"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error "Archivo de backup no encontrado: $BACKUP_FILE"
fi

# Encontrar el directorio de backup asociado
BACKUP_DIR=$(dirname "$BACKUP_FILE")

log "=========================================="
log "Iniciando Restauración de n8n"
log "=========================================="
log "📂 Archivo backup: $BACKUP_FILE"
log "🗄️ Base de datos destino: $DB_NAME"

# 1. Detener n8n
log "⏸️ Deteniendo contenedor n8n..."
docker stop $N8N_CONTAINER 2>/dev/null || warn "n8n no estaba corriendo"

# 2. Restaurar base de datos
log "📦 Restaurando base de datos..."
log "⚠️ Esto ELIMINARÁ la base de datos actual y la reemplazará"

read -p "¿Está seguro de continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restauración cancelada"
    docker start $N8N_CONTAINER 2>/dev/null || true
    exit 0
fi

# Eliminar y recrear la base de datos
log "🗑️ Eliminando base de datos actual..."
docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null

log "🔄 Restaurando desde backup..."
docker exec -i $DB_CONTAINER pg_restore -U $DB_USER -d $DB_NAME -c < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log "✅ Base de datos restaurada exitosamente"
else
    error "❌ Falló la restauración de la base de datos"
fi

# 3. Restaurar archivos (si existe el tar.gz)
FILES_BACKUP="$BACKUP_DIR/n8n_files_*.tar.gz"
FILES_BACKUP_FILE=$(ls $FILES_BACKUP 2>/dev/null | head -1)

if [ -f "$FILES_BACKUP_FILE" ]; then
    log "📁 Restaurando archivos de n8n..."
    
    # Backup del directorio actual por seguridad
    if [ -d "$N8N_DATA_DIR" ]; then
        mv "$N8N_DATA_DIR" "${N8N_DATA_DIR}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    fi
    
    # Crear directorio y restaurar
    mkdir -p "$N8N_DATA_DIR"
    tar -xzf "$FILES_BACKUP_FILE" -C ./v18/
    
    # Ajustar permisos
    chown -R 1000:1000 "$N8N_DATA_DIR" 2>/dev/null || true
    
    log "✅ Archivos restaurados"
else
    warn "⚠️ No se encontró backup de archivos para restaurar"
fi

# 4. Iniciar n8n nuevamente
log "▶️ Iniciando contenedor n8n..."
docker start $N8N_CONTAINER

# 5. Esperar a que n8n esté listo
log "⏳ Esperando a que n8n inicie..."
sleep 10

# 6. Verificar estado
if docker ps | grep -q $N8N_CONTAINER; then
    log "✅ n8n está corriendo"
else
    warn "⚠️ n8n no parece estar corriendo, verificar con: docker ps -a"
fi

log "=========================================="
log "✅ RESTAURACIÓN COMPLETADA"
log "=========================================="
log "📝 Para verificar los workflows:"
log "   Accede a https://n8n.integraia.lat"
log ""
log "📁 Backup de datos anterior (si existe):"
ls -d ${N8N_DATA_DIR}.backup.* 2>/dev/null | head -1 || echo "   No hay backup previo"
log "=========================================="