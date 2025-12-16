#!/bin/bash

echo "=== Configurando permisos para Docker Secrets ==="

# Crear directorio de secrets si no existe
mkdir -p secrets

# Generar secrets si no existen
if [ ! -f "secrets/postgres_password.txt" ]; then
    echo "Generando secrets..."
    # PostgreSQL (para Odoo y Chatwoot)
    openssl rand -hex 32 > secrets/postgres_password.txt
    openssl rand -hex 32 > secrets/redis_password.txt
    openssl rand -hex 32 > secrets/evolution_password.txt
    openssl rand -hex 32 > secrets/n8n_password.txt
    openssl rand -hex 64 > secrets/n8n_encryption_key.txt
    
    # Secrets específicos para Chatwoot
    openssl rand -hex 64 > secrets/chatwoot_secret_key_base.txt
    openssl rand -hex 32 > secrets/chatwoot_postgres_password.txt
fi

# Configurar permisos - para Docker, los secrets los debe poder leer el usuario
echo "Configurando permisos..."
chmod 750 secrets/
chmod 640 secrets/*.txt
chown odoo:odoo secrets/
chown odoo:odoo secrets/*.txt

echo "Permisos actuales:"
ls -la secrets/

echo ""
echo "✅ Secrets configurados"

# ===============================
# setup_odoo_user.sh
# Configura usuario, grupos, permisos y directorios para Odoo 18 + n8n + Evolution + Chatwoot
# ===============================

APP_USER="odoo"
APP_GROUP="odoo"
VERSION="18"

# UIDs REALES de los contenedores Docker:
# - PostgreSQL: usa usuario "postgres" con UID 999
# - Redis: usa usuario "redis" con UID 1001 (o se ejecuta como root)
# - Chatwoot: usa usuario "chatwoot" con UID 1001
# - n8n: usa usuario "node" con UID 1000

echo "=========================================="
echo "CONFIGURACIÓN DE DIRECTORIOS Y PERMISOS"
echo "=========================================="

echo "📁 Creando estructura de directorios..."

# Directorios base
mkdir -p "v${VERSION}"

# Directorios de Odoo
mkdir -p "v${VERSION}/pgdata/data"
mkdir -p "v${VERSION}/pgdata/init"
mkdir -p "v${VERSION}/filestore"
mkdir -p "v${VERSION}/addons"
mkdir -p "v${VERSION}/config"
mkdir -p "v${VERSION}/odoo-web-data"

# Directorios de n8n
mkdir -p "v${VERSION}/n8n_data"

# Directorios de logs y backups
mkdir -p "v${VERSION}/logs"
mkdir -p "v${VERSION}/backups"

# Directorios de pgadmin
mkdir -p "v${VERSION}/pgadmin-data/sessions"
mkdir -p "v${VERSION}/pgadmin-data/storage"
touch "v${VERSION}/pgadmin-data/servers.json"

# Directorios de Chatwoot
mkdir -p "v${VERSION}/chatwoot_pgdata"
mkdir -p "v${VERSION}/chatwoot_redis_data"
mkdir -p "v${VERSION}/chatwoot_storage"
mkdir -p "v${VERSION}/chatwoot_logs"
mkdir -p "v${VERSION}/chatwoot_overrides"

echo ""
echo "🔐 Configurando permisos..."

# 1. PostgreSQL Odoo - usuario postgres (UID 999)
echo "Configurando permisos para PostgreSQL Odoo..."
chown -R 999:999 "v${VERSION}/pgdata"
chmod -R 770 "v${VERSION}/pgdata"

# 2. Directorios de Odoo - usuario odoo
echo "Configurando permisos para Odoo..."
for dir in filestore config logs odoo-web-data addons backups; do
    if [ -d "v${VERSION}/$dir" ]; then
        chown -R "$APP_USER:$APP_GROUP" "v${VERSION}/$dir"
        chmod -R 775 "v${VERSION}/$dir"
        echo "  ✅ v${VERSION}/$dir"
    fi
done

# 3. n8n_data - usuario node (UID 1000)
echo "Configurando permisos para n8n..."
chown -R 1000:1000 "v${VERSION}/n8n_data"
chmod -R 775 "v${VERSION}/n8n_data"



# Create the directory if it doesn't exist

# Set proper ownership for pgadmin (UID 5050 is standard for pgadmin image)



# 5. CHATWOOT: Directorios para Chatwoot
echo "Configurando permisos para Chatwoot..."

# PostgreSQL Chatwoot - usuario postgres (UID 999) pero diferente directorio
chown -R 999:999 "v${VERSION}/chatwoot_pgdata"
chmod -R 770 "v${VERSION}/chatwoot_pgdata"
echo "  ✅ v${VERSION}/chatwoot_pgdata"

# Redis Chatwoot - usuario redis (UID 1001 en Alpine) o root
chown -R 1001:1001 "v${VERSION}/chatwoot_redis_data"
chmod -R 775 "v${VERSION}/chatwoot_redis_data"
echo "  ✅ v${VERSION}/chatwoot_redis_data"



# Storage y logs Chatwoot - usuario chatwoot (UID 1001)
for dir in chatwoot_storage chatwoot_logs chatwoot_overrides; do
    if [ -d "v${VERSION}/$dir" ]; then
        chown -R 1001:1001 "v${VERSION}/$dir"
        chmod -R 775 "v${VERSION}/$dir"
        echo "  ✅ v${VERSION}/$dir"
    fi
done

echo ""
echo "=========================================="
echo "RESUMEN DE CONFIGURACIÓN"
echo "=========================================="
echo "✅ Configuración completada!"
