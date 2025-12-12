#!/bin/bash
echo "🔧 Reparación RÁPIDA de permisos"

# 1. Secrets - permisos Docker
echo "1. Configurando secrets..."
sudo chmod 755 ./secrets/
sudo chmod 644 ./secrets/*.txt 2>/dev/null
sudo chown root:root ./secrets/ ./secrets/*.txt 2>/dev/null

# 2. Directorios Chatwoot
echo "2. Configurando directorios Chatwoot..."
sudo chown -R 999:999 ./v18/chatwoot_pgdata 2>/dev/null
sudo chmod -R 770 ./v18/chatwoot_pgdata 2>/dev/null

sudo chown -R 1001:1001 ./v18/chatwoot_redis_data 2>/dev/null
sudo chmod -R 775 ./v18/chatwoot_redis_data 2>/dev/null

for dir in chatwoot_storage chatwoot_logs chatwoot_overrides; do
    sudo chown -R 1001:1001 "./v18/$dir" 2>/dev/null
    sudo chmod -R 775 "./v18/$dir" 2>/dev/null
done

# 3. Directorios Odoo (importante para el problema original)
echo "3. Configurando directorios Odoo..."
sudo chown -R 999:999 ./v18/pgdata 2>/dev/null
sudo chmod -R 770 ./v18/pgdata 2>/dev/null

sudo chown -R 1001:1001 ./v18/odoo-web-data ./v18/logs ./v18/filestore ./v18/config 2>/dev/null
sudo chmod -R 775 ./v18/odoo-web-data ./v18/logs ./v18/filestore ./v18/config 2>/dev/null

mkdir -p "./v18/pgadmin-data"
sudo chown -R 5050:5050 v18/pgadmin-data
chmod -R 775 "v${VERSION}/pgadmin-data"


# # 4. Reiniciar
# echo "4. Reiniciando servicios..."
# docker-compose -f docker-compose.odoo.yml down 2>/dev/null
# docker-compose -f docker-compose.chatwoot.yml down 2>/dev/null
# sleep 2
# docker-compose -f docker-compose.odoo.yml up -d 2>/dev/null
# sleep 5
# docker-compose -f docker-compose.chatwoot.yml up -d 2>/dev/null

# echo "✅ Listo!"