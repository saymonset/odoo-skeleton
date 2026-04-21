#!/bin/bash

# entrypoint.sh mejorado para Odoo
set -e

echo "=== Iniciando Entrypoint de Odoo ==="

# Configuración
CONFIG_FILE="/etc/odoo/odoo.conf"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-odoo}"
DB_NAME="${POSTGRES_DB:-dbodoo18}"

# Leer contraseña desde el secret
if [ -f "/run/secrets/postgres_password" ]; then
    DB_PASSWORD=$(cat /run/secrets/postgres_password)
else
    echo "ERROR: No se encontró el archivo de contraseña de PostgreSQL"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# Función para verificar si PostgreSQL está listo
wait_for_postgres() {
    echo "Esperando a que PostgreSQL esté listo en $DB_HOST:$DB_PORT..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
        echo "PostgreSQL no está disponible aún... reintentando en 5 segundos"
        sleep 5
    done
    echo "PostgreSQL está listo!"
}

# Función para verificar si la base de datos existe
database_exists() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

# Función para verificar si Odoo está inicializado
odoo_initialized() {
    echo "Verificando si Odoo está inicializado en la base de datos..."
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM ir_module_module WHERE state = 'installed';" >/dev/null 2>&1; then
        COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM ir_module_module WHERE state = 'installed';" | tr -d ' \n')
        if [ "$COUNT" -gt 0 ]; then
            echo "Odoo ya está inicializado ($COUNT módulos instalados)"
            return 0
        fi
    fi
    echo "Odoo NO está inicializado"
    return 1
}

# Función para inicializar Odoo
initialize_odoo() {
    echo "=== INICIALIZANDO ODOO POR PRIMERA VEZ ==="
    echo "Esto puede tomar varios minutos..."
    
    # Ejecutar Odoo en modo inicialización
    /opt/odoo/odoo-core/odoo-bin -c "$CONFIG_FILE" -i base --stop-after-init
}

# Función para ejecutar Odoo normalmente
run_odoo() {
    echo "=== INICIANDO ODOO EN MODO PRODUCCIÓN ==="
    # Usar exec para reemplazar el proceso actual
    exec /opt/odoo/odoo-core/odoo-bin -c "$CONFIG_FILE" "$@"
}

# --- EJECUCIÓN PRINCIPAL ---

# Esperar a que PostgreSQL esté listo
wait_for_postgres

# Verificar si la base de datos existe
if ! database_exists; then
    echo "ERROR: La base de datos '$DB_NAME' no existe."
    echo "Asegúrate de que el contenedor de PostgreSQL esté configurado correctamente."
    exit 1
fi

# Verificar si Odoo necesita inicialización
if ! odoo_initialized; then
    initialize_odoo
    echo "=== INICIALIZACIÓN COMPLETADA ==="
    echo "Reiniciando Odoo en modo producción..."
    # Después de la inicialización, ejecutar normalmente
    run_odoo "$@"
else
    # Ejecutar Odoo normalmente
    run_odoo "$@"
fi