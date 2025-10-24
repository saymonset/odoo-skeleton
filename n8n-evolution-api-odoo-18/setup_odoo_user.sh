#!/bin/bash
# ===============================
# setup_odoo_user.sh
# Configura usuario, grupos, permisos y directorios para Odoo 18 + n8n + Evolution
# ===============================

# Crear un usuario normal con sudo
# ```bash
# adduser odoo
# usermod -aG sudo odoo
# sudo passwd odoo
# su odoo
# ````
APP_USER=odoo
APP_GROUP=odoo
VERSION=18

# Crear grupo si no existe
if ! getent group $APP_GROUP >/dev/null; then
    sudo groupadd $APP_GROUP
fi

# Crear usuario si no existe
if ! id -u $APP_USER >/dev/null 2>&1; then
    sudo useradd -m -g $APP_GROUP -s /bin/bash $APP_USER
fi

# Crear directorios necesarios y asignar permisos
DIRS=(
    "v${VERSION}/pgdata"
    "v${VERSION}/odoo-web-data"
    "v${VERSION}/addons"
    "v${VERSION}/logs"
    "v${VERSION}/filestore"
    "v${VERSION}/n8n_data"
)

for DIR in "${DIRS[@]}"; do
    sudo mkdir -p $DIR
    sudo chown -R $APP_USER:$APP_GROUP $DIR
    sudo chmod 750 $DIR
done

# Asegurar permisos de los secretos
SECRETS=(
    "secrets/postgres_password.txt"
    "secrets/evolution_password.txt"
    "secrets/redis_password.txt"
    "secrets/n8n_password.txt"
    "secrets/n8n_encryption_key.txt"
)

for SECRET in "${SECRETS[@]}"; do
    if [ -f $SECRET ]; then
        sudo chmod 600 $SECRET
        sudo chown $APP_USER:$APP_GROUP $SECRET
    else
        echo "⚠️  Aviso: el secreto $SECRET no existe, por favor crealo"
    fi
done

echo "✅ Directorios y permisos configurados correctamente para usuario $APP_USER"
