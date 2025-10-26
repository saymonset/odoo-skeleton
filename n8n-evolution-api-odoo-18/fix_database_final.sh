#!/bin/bash
echo "=== SOLUCIÓN COMPLETA ==="

# 1. Crear archivo .env
echo "Creando archivo .env..."
cat > .env << 'EOF'
VERSION=18
PGDATA=/var/lib/postgresql/data/pgdata
POSTGRES_USER=odoo
POSTGRES_DB=odoo
POSTGRES_PASSWORD=123456
DB_HOST=db
DB_PORT=5432
HOST=db
USER=odoo
PASSWORD=123456
EOF

# 2. Parar y limpiar
echo "Limpiando contenedores..."
docker-compose down

# 3. Reconstruir imagen
echo "Reconstruyendo imagen Odoo..."
docker build -t odoo-pers:18 .

# 4. Iniciar servicios
echo "Iniciando base de datos y Redis..."
docker-compose up -d db redis
sleep 15

# 5. Verificar BD
echo "Verificando base de datos..."
docker exec odoo-db18 psql -U odoo -d odoo -c "SELECT version();" && echo "✓ BD OK"

# 6. Iniciar Odoo
echo "Iniciando Odoo..."
docker-compose up -d web

# 7. Esperar y ver logs
echo "Esperando 10 segundos..."
sleep 10

echo "=== LOGS DE ODOO ==="
docker logs odoo-18

echo ""
echo "=== ESTADO FINAL ==="
docker-compose ps