# Creamos la imagen de odoo en doxker personalizada
# Install Docker en README-install-docker.md
# Luego ejecuta esto
 ```bash
 docker image rm odoo-pers:18  --force
 docker rm odoo-pers-18
 docker build -t odoo-pers:18 .
 ```
 # Ir a la carpeta src
  cd odoo-skeleton/n8n-evolution-api-odoo-18/src
#No hace falta ya. el dokcerfile lo tiene predeterminado.ignorar: bajamos repositorios
```bash
#git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo/odoo.git odoo-18
#git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo-ide/odoo-stubs.git
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

#Ejecutsar est script
```bash
chmod +x setup_odoo_user.sh
sudo ./setup_odoo_user.sh
sudo chown -R $(whoami):$(whoami) ./secrets
sudo chmod 777 ./secrets/*.txt
# # Clean up volumes
# sudo rm -rf ./v18/pgdata
# sudo rm -rf ./v18/n8n_data
# sudo rm -rf ./v18/logs

 mkdir -p ./v18/pgadmin-data  ./v18/filestore ./v18/addons ./v18/config ./v18/odoo-web-data ./v18/pgdata ./v18/n8n_data ./v18/logs

# # Recreate directories with proper permissions
# sudo chown -R 1000:1000 ./v18/n8n_data ./v18/logs
# sudo chmod -R 777 ./v18
# En tu servidor (fuera de Docker)
sudo chown -R 1001:1001 ./v18
sudo chown -R 5050:5050 ./v18/pgadmin-data
 # Todos los directorios que monta Odoo deben ser del UID 1001
 cd v18
sudo chown -R 1001:1001 ./odoo-web-data
sudo chown -R 1001:1001 ./config
sudo chown -R 1001:1001 ./addons/extra
sudo chown -R 1001:1001 ./addons/oca


sudo chown -R 1001:1001 ./addons/enterprise
sudo chown -R 1001:1001 ./filestore

# Corrige permisos del volumen
sudo chown -R 1000:1000 ./v18/n8n_data
# Crea el directorio
mkdir -p ./v18/filestore

# Da permisos correctos (uid 1001 = odoo)
sudo chown -R 1001:1001 ./v18/filestore

sudo usermod -aG docker $USER
newgrp docker
 docker compose down -v
 mkdir -p ./v18/pgdata/init
 cat > ./v18/pgdata/init/01-create-db.sql << 'EOF'
-- Crear base de datos si no existe
SELECT 'CREATE DATABASE evolution_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'evolution_db')\gexec
EOF



 # Copiar el archivo env-example a .env
 ```bash
 cp env-example .env
 ```


 # Creamos la red en docker
 ```bash
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

### down :
```bash
docker-compose down 
```

### start :

```bash 
docker compose --env-file .env up --build
```
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
# ###############COLOCAR SEGURIDAD####################
# Ir a hacer las instrcciones del archivo
```bash
 seguridad_UFW_Nginx_odoo.md
 ```
 # ####################################