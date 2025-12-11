 1. Construcción de la Imagen Personalizada
 # Eliminar recursos anteriores (opcional)
docker rm -f odoo-pers-18 2>/dev/null || true
docker image rm odoo-pers:18 2>/dev/null || true

# Construir nueva imagen
docker build -t odoo-pers:18 .



 ```
 # Ir a la carpeta src
  cd odoo-skeleton/n8n-evolution-api-odoo-18/src
#No hace falta ya. el dokcerfile lo tiene predeterminado.ignorar: bajamos repositorios
```bash
#git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo/odoo.git odoo-18
#git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo-ide/odoo-stubs.git
``` 

 2. Generación de Secretos de Forma Segura
# Crear directorio para secretos
mkdir -p secrets

# Generar contraseñas aleatorias
echo "Generando secretos..."
openssl rand -hex 32 | tee secrets/postgres_password.txt
openssl rand -hex 32 | tee secrets/evolution_password.txt
openssl rand -hex 32 | tee secrets/redis_password.txt
openssl rand -hex 32 | tee secrets/n8n_password.txt
openssl rand -hex 64 | tee secrets/n8n_encryption_key.txt

# Proteger los secretos
sudo chown -R $(whoami):$(whoami) secrets
 
 3. Configuración de Usuarios y Permisos
bash
# Ejecutar script de configuración
chmod +x setup_odoo_user.sh
sudo ./setup_odo_user.sh



 # Copiar el archivo env-example a .env
 ```bash
 cp env-example .env
 ```


 # Creamos la red en docker
 ```bash
 # Crear red con nombre específico por versión
source .env 2>/dev/null || VERSION="18"
docker network create odoo-network-${VERSION} 2>/dev/null || echo "Red ya existe"

# Verificar red creada
docker network ls | grep odoo-network
 ```
 # Dar permisos
 ```bash
 # Configurar script de backup
chmod +x backup/backup.sh

# Probar backup manualmente
./backup/backup.sh test

 ```
###
```bash
Asegurate que la variable de ambiente file este : .env
```

### down :
```bash
docker-compose down 
```
 
# 4. Inicia en orden:
# Primero Odoo stack
docker compose -f docker-compose.odoo.yml up -d

# Espera a que PostgreSQL esté listo
sleep 10

# Luego n8n
docker compose -f docker-compose.n8n.yml up -d

# Finalmente Chatwoot (después de arreglar los problemas)
docker compose -f docker-compose.chatwoot.yml up


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