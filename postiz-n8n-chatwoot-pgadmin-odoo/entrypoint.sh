#!/bin/bash
set -e

echo "=== Iniciando Entrypoint de Odoo (root) ==="

CONFIG_FILE="/etc/odoo/odoo.conf"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-odoo}"
DB_NAME="${POSTGRES_DB:-dbodoo18}"

if [ -f "/run/secrets/postgres_password" ]; then
    DB_PASSWORD=$(cat /run/secrets/postgres_password)
else
    echo "ERROR: No se encontró el archivo de contraseña"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

wait_for_postgres() {
    echo "Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; do
        sleep 5
    done
    echo "PostgreSQL está listo!"
}

database_exists() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

database_initialized() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='res_users'" 2>/dev/null | grep -q 1
}

wait_for_postgres

# ============================================
# CORREGIR PERMISOS DEL FILESTORE (CRÍTICO)
# ============================================
FILESTORE_DIR="/var/lib/odoo/.local/share/Odoo"
echo "Asegurando permisos de $FILESTORE_DIR..."
mkdir -p "$FILESTORE_DIR"
chown -R 1001:1001 "$FILESTORE_DIR"
chmod 775 "$FILESTORE_DIR"

# Crear la base de datos si no existe
if ! database_exists; then
    echo "INFO: La base de datos '$DB_NAME' no existe. Creándola..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo "INFO: Base de datos '$DB_NAME' creada."
fi

# Inicializar la base de datos si no está inicializada
if ! database_initialized; then
    echo "INFO: Base de datos no inicializada. Inicializando con módulo base (esto puede tomar 2-3 minutos)..."
    cd /opt/odoo/odoo-core
    python3 odoo-bin -c "$CONFIG_FILE" --database="$DB_NAME" --stop-after-init -i base --log-level=info --without-demo=True
    echo "INFO: Base de datos inicializada correctamente."
else
    echo "INFO: Base de datos ya inicializada."
fi

# Buscar el binario de Odoo
if [ -f "/opt/odoo/odoo-core/odoo-bin" ]; then
    ODOO_BIN="/opt/odoo/odoo-core/odoo-bin"
else
    echo "ERROR: No se encontró odoo-bin"
    exit 1
fi

echo "Iniciando Odoo con usuario odoo..."
# Cambiar al usuario odoo usando sudo (sin contraseña) y ejecutar en primer plano
#exec sudo -u odoo bash -c "$ODOO_BIN -c $CONFIG_FILE --database=$DB_NAME --db_user=$DB_USER --db_host=$DB_HOST --db_port=$DB_PORT $*"

# En lugar de:
# exec sudo -u odoo bash -c "$ODOO_BIN -c $CONFIG_FILE ..."

# Usa:
exec sudo -u odoo /opt/venv/bin/python $ODOO_BIN -c $CONFIG_FILE --database=$DB_NAME --db_user=$DB_USER --db_host=$DB_HOST --db_port=$DB_PORT $*