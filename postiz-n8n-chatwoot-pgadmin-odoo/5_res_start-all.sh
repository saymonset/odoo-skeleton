 #!/bin/bash
echo "🔄 Reiniciando todos los servicios..."
docker compose -f docker-compose.yaml restart
echo "✅ Servicios reiniciados"
echo ""
echo "Estado de los servicios:"
docker compose -f docker-compose.yaml ps