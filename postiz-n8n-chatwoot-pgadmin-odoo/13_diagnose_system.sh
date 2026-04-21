 #!/bin/bash
echo "=== DIAGNÓSTICO DE LA VERSIÓN 18 ==="
echo ""

echo "1. Contenedores:"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "odoo-18|n8n|postiz|temporal"

echo ""
echo "2. Logs de Odoo 18 (últimas 15 líneas):"
docker logs odoo-18-web --tail=15 2>&1

echo ""
echo "3. Logs de n8n (últimas 15 líneas):"
docker logs n8n-container --tail=15 2>&1

echo ""
echo "4. Logs de Postiz (últimas 15 líneas):"
docker logs postiz --tail=15 2>&1

echo ""
echo "5. Bases de datos:"
docker exec odoo-db18-n8n psql -U odoo -d postgres -c "\l" 2>/dev/null | head -10

echo ""
echo "6. Prueba de puertos:"
nc -zv localhost 18069 2>&1 && echo "✅ Odoo 18: puerto 18069 abierto" || echo "❌ Odoo 18: puerto 18069 cerrado"
nc -zv localhost 5678 2>&1 && echo "✅ n8n: puerto 5678 abierto" || echo "❌ n8n: puerto 5678 cerrado"
nc -zv localhost 4007 2>&1 && echo "✅ Postiz: puerto 4007 abierto" || echo "❌ Postiz: puerto 4007 cerrado"