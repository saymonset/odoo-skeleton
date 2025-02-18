#!/bin/bash
# Activar el entorno virtual
source /opt/venv/bin/activate

# Ejecutar el comando proporcionado
exec "$@"