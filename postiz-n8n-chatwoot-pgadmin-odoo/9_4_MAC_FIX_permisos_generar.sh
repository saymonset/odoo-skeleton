 #!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[INFO] Ajustando permisos para Odoo en macOS...${NC}"

# 1. Cambiar propietario al usuario actual en el Host para toda la carpeta v18
# Esto asegura que tú (simon) puedas manipular los archivos desde el buscador si es necesario.
echo -e "${BLUE}[INFO] 1/4 Seteando propietario como $(whoami)...${NC}"
sudo chown -R $(whoami):staff ./v18

# 2. Crear directorios críticos si no existen
echo -e "${BLUE}[INFO] 2/4 Creando estructura de directorios...${NC}"
mkdir -p v18/odoo-web-data/.local/share/Odoo/sessions
mkdir -p v18/data/addons/{oca,extra,enterprise}
mkdir -p v18/logs

# 3. Dar permisos totales (777) a las carpetas de datos que el contenedor Odoo necesita escribir
# Esto resuelve el Error 13 Permission Denied
echo -e "${BLUE}[INFO] 3/4 Aplicando chmod 777 a volúmenes de datos...${NC}"
sudo chmod -R 777 v18/odoo-web-data
sudo chmod -R 777 v18/data
sudo chmod -R 777 v18/logs
sudo chmod -R 777 v18/odoo_n8n_pgdata

# 4. Reiniciar el servicio para aplicar cambios
echo -e "${BLUE}[INFO] 4/4 Reiniciando Odoo para refrescar conexiones...${NC}"
docker stop odoo-18-web
docker start odoo-18-web

echo -e "${GREEN}[OK] ✅ Permisos aplicados con éxito.${NC}"
echo -e "${YELLOW}[TIP] Ahora intenta recargar Odoo en http://localhost:18069${NC}"