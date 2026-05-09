#!/bin/bash
# 9_1_backup_sistema_completo.sh
set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Verificar scripts
if [ ! -f "./backup/backup.sh" ]; then
    error "No se encuentra ./backup/backup.sh"
fi

chmod +x ./backup/backup.sh

# Ejecutar backup
log "🚀 Iniciando proceso de backup unificado..."
./backup/backup.sh

if [ $? -eq 0 ]; then
    log "✅ Proceso finalizado correctamente."
else
    error "❌ El backup falló. Revisa los logs arriba."
fi
