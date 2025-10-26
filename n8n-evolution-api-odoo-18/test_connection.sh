#!/bin/bash
echo "=== DIAGNÓSTICO DE CONEXIÓN ==="

# Probar conexión desde el host a la base de datos
echo "1. Probando conexión desde host:"
docker exec odoo-db18 pg_isready -U odoo -d odoo

echo ""
echo "2. Probando conexión desde contenedor Odoo:"
docker exec odoo-18 bash -c 'PGPASSWORD=123456 psql -h db -U odoo -d odoo -c "SELECT version();"'

echo ""
echo "3. Variables de entorno en Odoo:"
docker exec odoo-18 env | grep -E "(HOST|USER|PASSWORD|DB)"

echo ""
echo "4. Verificar archivo odoo.conf:"
docker exec odoo-18 cat /etc/odoo/odoo.conf | grep -E "(db_|log)"

echo ""
echo "5. Verificar logs de Odoo:"
docker logs odoo-18 --tail 10