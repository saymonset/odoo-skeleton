 #!/bin/bash
# 9_3_restore_solo_odoo.sh
set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Verificar scripts
if [ ! -f "./backup/restore.sh" ]; then
    error "No se encuentra ./backup/restore.sh"
fi

chmod +x ./backup/restore.sh

# Ejecutar restauración de Odoo
log "🚀 Iniciando restauración de Odoo..."
./backup/restore.sh "$@"

if [ $? -eq 0 ]; then
    log "✅ Odoo restaurado."
else
    error "❌ La restauración de Odoo falló."
fi
