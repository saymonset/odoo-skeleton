 # Ir a la carpeta raiz
  odoo-skeleton/n8n-evolution-api-odoo-18
 
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
### down :
```bash
docker-compose down 
```

### start :
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d

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
