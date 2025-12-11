#!/bin/bash
# ===============================
# setup_odoo_user.sh
# Configura usuario, grupos, permisos y directorios para Odoo 18 + n8n + Evolution
# ===============================

APP_USER=odoo
APP_GROUP=odoo
VERSION=18

# UIDs que se usarán en Docker
DOCKER_ODOO_UID=1001
DOCKER_ODOO_GID=1001
DOCKER_N8N_UID=1000
DOCKER_N8N_GID=1000
DOCKER_POSTGRES_UID=999
DOCKER_POSTGRES_GID=999

# Crear grupo odoo si no existe
if ! getent group $APP_GROUP >/dev/null; then
    sudo groupadd -g $DOCKER_ODOO_GID $APP_GROUP
    echo "✅ Grupo $APP_GROUP creado con GID $DOCKER_ODOO_GID"
else
    echo "ℹ️  Grupo $APP_GROUP ya existe"
fi

# Crear usuario odoo si no existe
if ! id -u $APP_USER >/dev/null 2>&1; then
    sudo useradd -m -u $DOCKER_ODOO_UID -g $APP_GROUP -s /bin/bash $APP_USER
    echo "✅ Usuario $APP_USER creado con UID $DOCKER_ODOO_UID"
else
    # Verificar si el usuario tiene el UID correcto
    CURRENT_UID=$(id -u $APP_USER)
    if [ "$CURRENT_UID" != "$DOCKER_ODOO_UID" ]; then
        echo "⚠️  ADVERTENCIA: El usuario $APP_USER tiene UID $CURRENT_UID, no $DOCKER_ODOO_UID"
        echo "   Para cambiar el UID ejecuta: sudo usermod -u $DOCKER_ODOO_UID $APP_USER"
    else
        echo "ℹ️  Usuario $APP_USER ya existe con UID correcto ($DOCKER_ODOO_UID)"
    fi
fi

# Crear grupo para n8n si no existe
if ! getent group n8n >/dev/null; then
    sudo groupadd -g $DOCKER_N8N_GID n8n
    echo "✅ Grupo n8n creado con GID $DOCKER_N8N_GID"
fi

# Agregar usuario odoo al grupo n8n
sudo usermod -a -G n8n $APP_USER
echo "✅ Usuario $APP_USER agregado al grupo n8n"

# Crear estructura de directorios
echo "📁 Creando estructura de directorios..."
sudo mkdir -p ./v${VERSION}/{pgdata/{data,init},filestore,addons,config,odoo-web-data,n8n_data,logs,backups,pgadmin-data}

# Configurar permisos jerárquicamente

# 1. PostgreSQL (usuario 999 en Docker)
echo "🔐 Configurando permisos para PostgreSQL..."
sudo chown -R $DOCKER_POSTGRES_UID:$DOCKER_POSTGRES_GID ./v${VERSION}/pgdata
sudo chmod -R 750 ./v${VERSION}/pgdata

# 2. Directorios de Odoo (usuario 1001 en Docker, usuario odoo en sistema)
echo "🔐 Configurando permisos para Odoo..."
for dir in filestore config logs odoo-web-data addons backups; do
    sudo chown -R $APP_USER:$APP_GROUP ./v${VERSION}/$dir
    sudo chmod -R 775 ./v${VERSION}/$dir
done

# 3. n8n_data (usuario 1000 en Docker)
echo "🔐 Configurando permisos para n8n..."
sudo chown -R $DOCKER_N8N_UID:$DOCKER_N8N_GID ./v${VERSION}/n8n_data
sudo chmod -R 775 ./v${VERSION}/n8n_data

# 4. pgadmin-data (acceso compartido)
echo "🔐 Configurando permisos para pgAdmin..."
sudo chown -R $APP_USER:$APP_GROUP ./v${VERSION}/pgadmin-data
sudo chmod -R 775 ./v${VERSION}/pgadmin-data

# Instalar y configurar ACLs para permisos compartidos (opcional pero recomendado)
echo "🔧 Configurando ACLs para permisos compartidos..."
if ! command -v setfacl &> /dev/null; then
    echo "📦 Instalando paquete acl..."
    sudo apt-get update && sudo apt-get install -y acl
fi

# Configurar ACLs para directorios compartidos
for dir in addons filestore; do
    if [ -d "./v${VERSION}/$dir" ]; then
        # Permisos default (heredados por nuevos archivos)
        sudo setfacl -R -d -m u:$APP_USER:rwx,g:$APP_GROUP:rwx ./v${VERSION}/$dir
        # Permisos para archivos existentes
        sudo setfacl -R -m u:$APP_USER:rwx,g:$APP_GROUP:rwx ./v${VERSION}/$dir
        echo "✅ ACLs configuradas para ./v${VERSION}/$dir"
    fi
done

# Verificar la instalación de ACL
sudo apt-get install -y acl 2>/dev/null || true

# Asegurar permisos de los secretos
echo "🔒 Configurando permisos de archivos secretos..."
SECRETS_DIR="secrets"
sudo mkdir -p $SECRETS_DIR
sudo chown $APP_USER:$APP_GROUP $SECRETS_DIR
sudo chmod 750 $SECRETS_DIR

SECRETS=(
    "postgres_password.txt"
    "evolution_password.txt"
    "redis_password.txt"
    "n8n_password.txt"
    "n8n_encryption_key.txt"
)

for SECRET in "${SECRETS[@]}"; do
    FILE="$SECRETS_DIR/$SECRET"
    if [ -f "$FILE" ]; then
        sudo chmod 640 "$FILE"
        sudo chown $APP_USER:$APP_GROUP "$FILE"
        echo "✅ Permisos configurados para $FILE"
    else
        echo "⚠️  Aviso: el secreto $FILE no existe, creando plantilla..."
        sudo touch "$FILE"
        sudo chmod 640 "$FILE"
        sudo chown $APP_USER:$APP_GROUP "$FILE"
        echo "# Agrega aquí la contraseña para $(basename $SECRET .txt)" | sudo tee "$FILE" > /dev/null
    fi
done

# Mostrar resumen
echo ""
echo "=========================================="
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo "Usuario del sistema: $APP_USER (UID: $(id -u $APP_USER 2>/dev/null || echo 'N/A'))"
echo "Grupo del sistema: $APP_GROUP (GID: $(getent group $APP_GROUP | cut -d: -f3 2>/dev/null || echo 'N/A'))"
echo ""
echo "📁 Permisos de directorios:"
ls -ld ./v${VERSION}/* 2>/dev/null || true
echo ""
echo "🔍 Verificando accesos:"
id $APP_USER
echo ""
echo "💡 Para probar permisos:"
echo "   sudo -u $APP_USER touch ./v${VERSION}/addons/test_file.txt"
echo "   sudo -u $APP_USER rm ./v${VERSION}/addons/test_file.txt"