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
# bajamos repositorios
```bash
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo/odoo.git odoo-18
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo-ide/odoo-stubs.git
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

# mkdir -p ./v18/filestore ./v18/addons ./v18/config ./v18/odoo-web-data ./v18/pgdata ./v18/n8n_data ./v18/logs

# # Recreate directories with proper permissions
# sudo chown -R 1000:1000 ./v18/n8n_data ./v18/logs
# sudo chmod -R 777 ./v18

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

# Actibar firewall

# PASO 1: Activar y configurar el firewall (ufw)
# Primero, activa ufw y permite solo lo necesario.
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```
# permite el SSH (para no perder acceso remoto):
```bash
sudo ufw allow ssh
```
# Ahora, permite el puerto 18069, pero de forma controlada.
```bash
sudo ufw allow from 147.93.179.254 to any port 18069 proto tcp
```
# Activa el firewall:
```bash
sudo ufw enable
sudo ufw status numbered
```
# Verificar la exposición del puerto
```bash
 nc -zv 147.93.179.254 18069
 sudo ufw status
sudo ss -tuln | grep 18069
 ```
 # Abrimox el puerto 80
 ```bash
 sudo ufw delete allow 80/tcp
 sudo ufw allow from 147.93.179.254 to any port 80 proto tcp
 sudo ufw allow 80/tcp
 sudo ufw reload
 ```
#  Endurecer el servidor contra hackeos  Actualizar paquete
```bash
sudo apt update && sudo apt upgrade -y
```



# Instalar Fail2ban
# (bloquea IPs que hagan intentos de acceso sospechosos
```bash
sudo apt install fail2ban -y
```
<!-- 
Deshabilitar login directo de root por SSH
Edita:

sudo nano /etc/ssh/sshd_config


Y cambia:

PermitRootLogin no


Luego:

sudo systemctl restart ssh -->

# Instalar rkhunter o chkrootkit para detectar malware:
```bash
sudo apt install rkhunter chkrootkit -y
sudo rkhunter --update
sudo rkhunter --check
```

# Comprobar que todo este correcto
```bash
sudo ufw status verbose
sudo ss -tuln | grep 18069
```



```bash
sudo ufw status

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
