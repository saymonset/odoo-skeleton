#!/bin/bash
echo "=== DIAGNÓSTICO COMPLETO ==="

echo "1. Estado de contenedores:"
docker-compose ps

echo ""
echo "2. Logs de PostgreSQL:"
docker logs odoo-db18 --tail 20

echo ""
echo "3. Logs de Odoo:"
docker logs odoo-18 --tail 20

echo ""
echo "4. Verificar salud de BD:"
docker exec odoo-db18 pg_isready -U odoo

echo ""
echo "5. Verificar conexión de red:"
docker exec odoo-18 nc -zv db 5432

echo ""
echo "6. Verificar secrets:"
docker exec odoo-18 ls -la /run/secrets/
docker exec odoo-18 cat /run/secrets/postgres_password

echo ""
echo "7. Verificar variables en Odoo:"
docker exec odoo-18 env | grep -E "(HOST|USER|PASSWORD|DB)"

echo ""
echo "8. Intentar conexión manual a BD:"
docker exec odoo-18 bash -c '
  if [ -f "/run/secrets/postgres_password" ]; then
    PASSWORD=$(cat /run/secrets/postgres_password)
    PGPASSWORD=$PASSWORD psql -h db -U odoo -d odoo -c "SELECT version();" 2>/dev/null && echo "CONEXIÓN EXITOSA" || echo "ERROR DE CONEXIÓN"
  else
    echo "NO HAY ARCHIVO DE PASSWORD"
  fi
'