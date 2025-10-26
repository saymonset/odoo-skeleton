#!/bin/bash
set -e

echo "=== Odoo 18 Debug Mode ==="
echo "Starting Odoo with debugpy..."
echo "Working directory: $(pwd)"

# Cambiar al directorio de Odoo (por si acaso)
cd /opt/odoo/odoo-core

# Ejecutar el comando original
exec "$@"