#!/bin/bash
# 9_1_backup_n8n.sh

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Verificar que el script de backup existe
if [ ! -f "./backup_n8n/backup.sh" ]; then
    error "No se encuentra ./backup_n8n/backup.sh"
fi

# Dar permisos de ejecución
chmod +x ./backup_n8n/backup.sh

# Ejecutar backup
log "=========================================="
log "Ejecutando backup de n8n"
log "=========================================="

./backup_n8n/backup.sh

if [ $? -eq 0 ]; then
    log "✅ Backup completado exitosamente"
    info "Los backups se guardaron en: ./backup_n8n/out/"
    echo ""
    echo "📂 Últimos backups:"
    ls -ltd ./backup_n8n/out/backup_n8n_* | head -5
else
    error "❌ Falló el backup"
fi