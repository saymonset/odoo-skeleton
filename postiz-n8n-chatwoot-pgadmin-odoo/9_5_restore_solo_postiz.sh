 #!/bin/bash
# 9_5_restore_solo_postiz.sh
set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Verificar scripts
if [ ! -f "./backup/restore_solo_postiz.sh" ]; then
    error "No se encuentra ./backup/restore_solo_postiz.sh"
fi

chmod +x ./backup/restore_solo_postiz.sh

# Ejecutar restauración solo de postiz
log "🚀 Restaurando SOLO Postiz (base de datos y archivos)..."
./backup/restore_solo_postiz.sh "$@"
