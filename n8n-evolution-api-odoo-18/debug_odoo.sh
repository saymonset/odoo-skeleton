#!/bin/bash
echo "=== Iniciando Odoo en modo DEBUG ==="

# Parar servicios
docker-compose down

# Iniciar solo la base de datos y redis
docker-compose up -d db redis

# Esperar a que estén listos
echo "Esperando a PostgreSQL y Redis..."
sleep 10

# Iniciar Odoo en modo debug
docker-compose up -d web

echo "Odoo está iniciando en modo debug..."
echo "Puerto Debug: 15679"
echo "Puerto Odoo: 18069"
echo ""
echo "Para conectar el debugger en VSCode:"
echo "1. Ve a la pestaña 'Run and Debug' (Ctrl+Shift+D)"
echo "2. Selecciona 'Debug Odoo Docker'"
echo "3. Click en 'Play'"
echo ""
echo "Para ver logs: docker logs -f odoo-18"