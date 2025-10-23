 # Ir a la carpeta src
  odoo-skeleton/n8n-evolution-api-odoo-18/src
# bajamos repositorios
```bash
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo/odoo.git odoo-18
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo-ide/odoo-stubs.git
``` 
#Ejecutsar este escript
```bash
chmod +x setup_odoo_user.sh
sudo ./setup_odoo_user.sh
sudo chown -R $(whoami):$(whoami) ./secrets
sudo chmod 777 ./secrets/*.txt
# Clean up volumes
sudo rm -rf ./v18/pgdata
sudo rm -rf ./v18/n8n_data
sudo rm -rf ./v18/logs

mkdir -p ./v18/{pgdata,n8n_data,logs}

# Recreate directories with proper permissions
sudo chown -R 1000:1000 ./v18/n8n_data ./v18/logs

sudo mkdir -p ./v18/odoo-web-data ./v18/config ./v18/addons ./v18/logs ./v18/filestore ./v18/n8n_data
sudo chown -R 1000:1000 ./v18
sudo chmod -R 777 ./v18
sudo chown 1000:1000 ./v18/logs
sudo chmod 775 ./v18/logs
sudo chown 1000:1000 ./v18/logs
sudo chmod 775 ./v18/logs
sudo chmod 600 ./v18/n8n_data/config
sudo usermod -aG docker $USER
newgrp docker
 docker compose down -v
docker compose --env-file .env up --build

sudo chmod -R 777 ./v18
mkdir -p ./v18/pgdata/init
cat > ./v18/pgdata/init/01-create-db.sql << 'EOF'
-- Crear base de datos si no existe
SELECT 'CREATE DATABASE evolution_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution_db')\gexec
EOF
 # Ir a la carpeta raiz
  odoo-skeleton/n8n-evolution-api-odoo-18
# Creamos la imagen de odoo en doxker personalizada
```bash
 docker image rm odoo-pers:18  --force
 docker rm odoo-pers-18
 docker build -t odoo-pers:18 .
```

 # Crear secretos de forma segura
 # Ejecuta en tu terminal:
 ```bash
    mkdir -p secrets
    openssl rand -hex 32 > secrets/postgres_password.txt
    openssl rand -hex 32 > secrets/evolution_password.txt
    openssl rand -hex 32 > secrets/redis_password.txt
    openssl rand -hex 32 > secrets/n8n_password.txt
    openssl rand -hex 64 > secrets/n8n_encryption_key.txt
```

 # Copiar el archivo env-example a .env
 ```bash
 cp env-example .env
 ```

 # Creamos la red en docker
 ```
 docker network create odoo_network_${VERSION}
 ```
 # Dar permisos
 ```bash
 chmod +x backup/backup.sh

 ```
###
```bash
Asegurate que la variable de ambiente file este : .env
```

# Configurar permisos seguros
 # Solo el usuario puede leer/escribir
```
chmod 600 secrets/* 
```
### down :
```bash
docker-compose down 
```

### start :
```bash
docker compose --env-file .env up -d

```

## Verificar backup
```bash
docker exec -it doo_app_backup sh
ls /backup/daily

```

# ######################
# Estructura del proyecto
# #####################
project/
│
├── .env
├── docker-compose.prod.yml
├── secrets/
│   ├── postgres_password.txt
│   ├── evolution_password.txt
│   ├── redis_password.txt
│   ├── n8n_password.txt
│   └── n8n_encryption_key.txt
     backup/
    │   ├── backup.sh
    │   └── crontab
└── v18/
    ├── addons/
    ├── config/
    ├── logs/
    ├── odoo-web-data/
    ├── filestore/
    └── pgdata/
