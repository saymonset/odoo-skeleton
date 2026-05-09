#!/bin/bash

# Script para desplegar servicios adicionales (n8n, pgAdmin, Chatwoot)
# Autor: Configuración personalizada
# Fecha: $(date +%Y-%m-%d)

set -e  # Detener el script si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

# ============================================
# 0. VERIFICAR RED DOCKER
# ============================================
print_header "Paso 0: Verificando red Docker"

if docker network ls | grep -q "odoo_network_18"; then
    print_message "✓ Red odoo_network_18 existe"
else
    print_warning "Red odoo_network_18 no existe, creándola..."
    docker network create odoo_network_18
    print_message "✓ Red odoo_network_18 creada"
fi

# ============================================
# 1. DETENER SERVICIOS ANTIGUOS (OPCIONAL)
# ============================================
print_header "Paso 1: Deteniendo servicios antiguos (opcional)"

read -p "¿Deseas detener y recrear los servicios? (yes/no): " RECREATE

if [ "$RECREATE" = "yes" ]; then
    print_message "Deteniendo servicios existentes (excepto db y redis)..."
    # Detener solo servicios adicionales, no los de Odoo
    docker compose -f docker-compose.yaml stop n8n chatwoot-postgres chatwoot-app chatwoot-sidekiq 2>/dev/null || true
    docker compose -f docker-compose.yaml rm -f n8n chatwoot-postgres chatwoot-app chatwoot-sidekiq 2>/dev/null || true
    docker compose -f docker-compose.pgadmin.yml down 2>/dev/null || true
    print_message "✓ Servicios adicionales detenidos"
fi

# ============================================
# 2. ASEGURAR QUE LOS SERVICIOS BASE ESTÉN CORRIENDO
# ============================================
print_header "Paso 2: Asegurando servicios base (PostgreSQL y Redis)"

# Levantar db y redis si no están corriendo
if ! docker ps | grep -q odoo-db18-n8n; then
    print_message "Levantando PostgreSQL..."
    docker compose -f docker-compose.yaml up -d db
    sleep 5
fi

if ! docker ps | grep -q odoo_redis; then
    print_message "Levantando Redis..."
    docker compose -f docker-compose.yaml up -d redis
    sleep 5
fi

# Esperar a que estén saludables
MAX_RETRIES=20
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if docker ps --filter "name=odoo-db18-n8n" --filter "status=running" | grep -q odoo-db18-n8n && \
       docker ps --filter "name=odoo_redis" --filter "status=running" | grep -q odoo_redis; then
        print_message "✓ Servicios base listos"
        break
    fi
    RETRY=$((RETRY+1))
    echo "Esperando servicios base... ($RETRY/$MAX_RETRIES)"
    sleep 3
done

# ============================================
# 3. CREAR ALIAS DE RED
# ============================================
print_header "Paso 3: Configurando alias de red"

# Alias para Redis
if docker ps | grep -q odoo_redis; then
    if ! docker network inspect odoo_network_18 | grep -q '"redis"'; then
        print_message "Agregando alias 'redis'..."
        docker network connect --alias redis odoo_network_18 odoo_redis 2>/dev/null && \
            print_message "✓ Alias 'redis' agregado" || \
            print_warning "No se pudo agregar alias 'redis'"
    else
        print_message "✓ Alias 'redis' ya existe"
    fi
fi

# Alias para PostgreSQL (db)
if docker ps | grep -q odoo-db18-n8n; then
    if ! docker network inspect odoo_network_18 | grep -q '"db"'; then
        print_message "Agregando alias 'db'..."
        docker network connect --alias db odoo_network_18 odoo-db18-n8n 2>/dev/null && \
            print_message "✓ Alias 'db' agregado" || \
            print_warning "No se pudo agregar alias 'db'"
    else
        print_message "✓ Alias 'db' ya existe"
    fi
fi

# ============================================
# 4. VERIFICAR BASE DE DATOS DE N8N
# ============================================
print_header "Paso 4: Verificando base de datos db_n8n"

if docker ps | grep -q odoo-db18-n8n; then
    if docker exec odoo-db18-n8n psql -U odoo -d postgres -c "\l" 2>/dev/null | grep -q db_n8n; then
        print_message "✓ Base de datos db_n8n ya existe"
    else
        print_message "Creando base de datos db_n8n..."
        docker exec odoo-db18-n8n psql -U odoo -d postgres -c "CREATE DATABASE db_n8n OWNER odoo;"
        print_message "✓ Base db_n8n creada"
    fi
fi

# ============================================
# 5. VERIFICAR ARCHIVOS DE SECRETOS
# ============================================
print_header "Paso 5: Verificando archivos de secretos"
mkdir -p secrets

if [ ! -f secrets/n8n_password.txt ]; then
    print_warning "Creando secrets/n8n_password.txt..."
    echo "n8n_password_$(openssl rand -hex 8)" > secrets/n8n_password.txt
    chmod 600 secrets/n8n_password.txt
fi

if [ ! -f secrets/n8n_encryption_key.txt ]; then
    print_warning "Creando secrets/n8n_encryption_key.txt..."
    echo "874eca07f4fe0a551b4c004843c91dc0c4a41f520687baaf40b4c64218c322a06b105d4e4e920e8fc3e8b5d70ccf696e1841d71a8028975f379754962de73b98" > secrets/n8n_encryption_key.txt
    chmod 600 secrets/n8n_encryption_key.txt
fi

print_message "✓ Secretos verificados"

# ============================================
# 6. DESPLEGAR N8N
# ============================================
print_header "Paso 6: Desplegando n8n"

if [ -f docker-compose.yaml ]; then
    print_message "Iniciando n8n desde docker-compose.yaml..."
    docker compose -f docker-compose.yaml up -d n8n
    sleep 15
    
    if docker ps | grep -q n8n-container; then
        print_message "✓ n8n desplegado correctamente"
        print_message "  Acceso: http://localhost:5678"
    else
        print_warning "⚠ n8n no está corriendo. Revisando logs..."
        docker logs n8n-container --tail=20 2>/dev/null || echo "Contenedor no encontrado"
    fi
else
    print_error "No se encontró docker-compose.yaml"
    exit 1
fi

# ============================================
# 7. DESPLEGAR PGADMIN
# ============================================
print_header "Paso 7: Desplegando pgAdmin"

if [ -f docker-compose.pgadmin.yml ]; then
    print_message "Iniciando pgAdmin..."
    docker compose -f docker-compose.pgadmin.yml up -d
    print_message "✓ pgAdmin desplegado correctamente"
    print_message "  Acceso: http://localhost:8080"
    print_message "  Email: oraclefedora@gmail.com"
    print_message "  Password: admin123"
else
    print_warning "No se encontró docker-compose.pgadmin.yml"
fi

# ============================================
# 8. DESPLEGAR CHATWOOT
# ============================================
print_header "Paso 8: Desplegando Chatwoot"

if [ -f docker-compose.yaml ]; then
    print_message "Iniciando Chatwoot desde docker-compose.yaml..."
    print_warning "Chatwoot puede tomar varios minutos en iniciar completamente..."
    docker compose -f docker-compose.yaml up -d chatwoot-postgres chatwoot-app chatwoot-sidekiq
    print_message "✓ Chatwoot desplegado correctamente"
    print_message "  Acceso: http://localhost:3000"
else
    print_warning "No se encontró docker-compose.yaml"
fi

# ============================================
# 9. VERIFICAR CONEXIONES
# ============================================
print_header "Paso 9: Verificando conexiones"

if docker ps | grep -q n8n-container; then
    print_message "Verificando conexión de n8n a PostgreSQL..."
    sleep 5
    if docker logs n8n-container --tail=10 2>&1 | grep -q "Connected to database\|initializing"; then
        print_message "✓ n8n conectado a la base de datos"
    else
        print_warning "⚠ Verifica logs de n8n (puede tardar un poco)"
    fi
fi

if docker ps | grep -q chatwoot-app; then
    print_message "Verificando conexión de Chatwoot a Redis..."
    sleep 5
    if docker logs chatwoot-app --tail=10 2>&1 | grep -q "Redis"; then
        print_message "✓ Chatwoot conectado a Redis"
    else
        print_warning "⚠ Verifica logs de Chatwoot"
    fi
fi

# ============================================
# 10. VERIFICAR ESTADO FINAL
# ============================================
print_header "Paso 10: Verificando estado de los servicios"

echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "n8n|pgadmin|chatwoot|odoo|redis" || true

# ============================================
# 11. INFORMACIÓN DE ACCESO
# ============================================
print_header "Información de acceso a servicios"

echo -e "${GREEN}=== Servicios Desplegados ===${NC}"
echo ""

if docker ps | grep -q n8n-container; then
    echo -e "${GREEN}✓ n8n:${NC} http://localhost:5678"
    echo "   Usuario: admin"
    echo "   Contraseña: (ver secrets/n8n_password.txt)"
    echo ""
fi

if docker ps | grep -q pgadmin-container; then
    echo -e "${GREEN}✓ pgAdmin:${NC} http://localhost:8080"
    echo "   Email: oraclefedora@gmail.com"
    echo "   Password: admin123"
    echo ""
fi

if docker ps | grep -q chatwoot-app; then
    echo -e "${GREEN}✓ Chatwoot:${NC} http://localhost:3000"
    echo "   Configuración inicial: completar el formulario"
    echo ""
fi

if docker ps | grep -q odoo-18-web; then
    echo -e "${GREEN}✓ Odoo 18:${NC} http://localhost:18069"
    echo "   Usuario: admin"
    echo "   Contraseña: admin"
    echo ""
fi

if docker ps | grep -q odoo_redis; then
    echo -e "${GREEN}✓ Redis:${NC} localhost:6379"
    echo "   Password: redis123"
    echo ""
fi

if docker ps | grep -q odoo-db18-n8n; then
    echo -e "${GREEN}✓ PostgreSQL:${NC} localhost:5432"
    echo "   Database: dbodoo18"
    echo "   User: odoo"
    echo ""
fi

# ============================================
# 12. COMANDOS ÚTILES
# ============================================
print_header "Comandos útiles"

echo "Para ver logs:"
echo "  docker logs -f n8n-container"
echo "  docker compose -f docker-compose.yaml logs -f chatwoot-app"
echo ""
echo "Para reiniciar servicios:"
echo "  docker compose -f docker-compose.yaml restart n8n"
echo "  docker compose -f docker-compose.yaml restart chatwoot-app chatwoot-sidekiq"
echo ""
echo "Para detener servicios adicionales (sin afectar Odoo):"
echo "  docker compose -f docker-compose.yaml stop n8n chatwoot-app chatwoot-sidekiq"
echo "  docker compose -f docker-compose.pgadmin.yml down"
echo ""

print_message "¡Despliegue de servicios adicionales completado!"