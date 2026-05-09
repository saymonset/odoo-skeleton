 #!/bin/bash
set -e

# ============================================
# CONFIGURACIÓN PRINCIPAL (ESCALABLE)
# ============================================
BACKUP_BASE_DIR="./backup/out"
ODOO_CONF="./v18/config/odoo.conf"

# Nombres de contenedores (fáciles de modificar)
DB_CONTAINER="odoo-db18-n8n"
WEB_CONTAINER="odoo-18-web"
REDIS_CONTAINER="odoo_redis"
NETWORK_NAME="odoo_network_18"

# Versión de Odoo
ODOO_VERSION="18"

# ============================================
# CONFIGURACIÓN ADICIONAL
# ============================================
DB_USER_DEFAULT="odoo"
DATA_DIR="./v18/data"
ADDONS_DIR="./v18/data/addons"
FILESTORE_DIR="./v18/data/filestore"
LOGS_DIR="./v18/logs"
WEB_DATA_DIR="./v18/odoo-web-data"
COMPOSE_ODOO_FILE="docker-compose.odoo.yml"

# ============================================
# FUNCIONES DE UTILIDAD
# ============================================

ensure_web_container() {
    if ! docker ps -a | grep -q "$WEB_CONTAINER"; then
        info "Contenedor $WEB_CONTAINER no existe, creándolo..."
        docker compose -f $COMPOSE_ODOO_FILE up -d web
        sleep 10
    fi
    
    if ! docker ps | grep -q "$WEB_CONTAINER"; then
        info "Contenedor $WEB_CONTAINER no está corriendo, iniciándolo..."
        docker compose -f $COMPOSE_ODOO_FILE start web
        sleep 10
    fi
    
    if docker ps | grep -q "$WEB_CONTAINER"; then
        log "✅ Contenedor $WEB_CONTAINER está corriendo"
    else
        error "❌ No se pudo iniciar el contenedor $WEB_CONTAINER"
    fi
}

exec_in_web() {
    docker exec $WEB_CONTAINER "$@"
}

exec_in_db() {
    docker exec $DB_CONTAINER "$@"
}

# Buscar el backup más reciente automáticamente
if [ -d "$BACKUP_BASE_DIR" ]; then
    LATEST_BACKUP=$(ls -td "$BACKUP_BASE_DIR"/backup_* 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DIR="$LATEST_BACKUP"
    else
        BACKUP_DIR="$BACKUP_BASE_DIR"
    fi
else
    BACKUP_DIR="$BACKUP_BASE_DIR"
fi

# Extraer variables del archivo de configuración
if [ -f "$ODOO_CONF" ]; then
    DB_NAME=$(grep -E '^db_name\s*=' "$ODOO_CONF" | awk -F '=' '{print $2}' | tr -d ' ' | tr -d '\r')
    DB_USER=$(grep -E '^db_user\s*=' "$ODOO_CONF" | awk -F '=' '{print $2}' | tr -d ' ' | tr -d '\r')
    DB_PASSWORD=$(grep -E '^db_password\s*=' "$ODOO_CONF" | awk -F '=' '{print $2}' | tr -d ' ' | tr -d '\r')
fi

DB_NAME=${DB_NAME:-dbodoo18}
DB_USER=${DB_USER:-$DB_USER_DEFAULT}

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

usage() {
    echo "Uso: $0 [opciones]"
    echo "Opciones:"
    echo "  -l, --list        Listar backups disponibles"
    echo "  -f, --file FILE   Restaurar desde archivo específico"
    echo "  --install-modules Instalar módulos OCA después de restaurar"
    echo "  -h, --help        Mostrar ayuda"
    exit 0
}

list_backups() {
    echo "=========================================="
    echo "📚 Backups disponibles en: $BACKUP_BASE_DIR"
    echo "=========================================="
    
    for backup in $(ls -td $BACKUP_BASE_DIR/backup_* 2>/dev/null); do
        echo ""
        echo "📁 $(basename $backup)"
        echo "   🗄️ Bases de datos:"
        ls -lh $backup/odoo_db_*.dump 2>/dev/null | awk '{print "      - " $9 " (" $5 ")"}' || echo "      No hay backups"
        echo "   📎 Filestore:"
        ls -lh $backup/odoo_filestore_*.tar.gz 2>/dev/null | awk '{print "      - " $9 " (" $5 ")"}' || echo "      No hay backups"
        echo "   📦 Addons:"
        ls -lh $backup/odoo_addons_*.tar.gz 2>/dev/null | awk '{print "      - " $9 " (" $5 ")"}' || echo "      No hay backups"
    done
}

install_oca_modules() {
    info "Instalando módulos OCA encontrados en $ADDONS_DIR/oca..."
    
    if [ ! -d "$ADDONS_DIR/oca" ]; then
        warn "No existe el directorio $ADDONS_DIR/oca"
        return
    fi
    
    exec_in_web bash -c "
        if ! grep -q '/opt/odoo/custom-addons/oca' /etc/odoo/odoo.conf; then
            sed -i 's|addons_path = .*|&,/opt/odoo/custom-addons/oca|' /etc/odoo/odoo.conf
            echo '✅ Ruta OCA agregada a addons_path'
        fi
    "
    
    for module in $(ls -d $ADDONS_DIR/oca/*/ 2>/dev/null | xargs -n 1 basename); do
        info "Instalando módulo OCA: $module"
        exec_in_web python3 /opt/odoo/odoo-core/odoo-bin \
            -c /etc/odoo/odoo.conf \
            --update=$module \
            --stop-after-init \
            --log-level=error 2>&1 | grep -E "ERROR|$module" || true
    done
    
    log "✅ Módulos OCA instalados"
}

install_extra_modules() {
    info "Instalando módulos EXTRA encontrados en $ADDONS_DIR/extra..."
    
    if [ ! -d "$ADDONS_DIR/extra" ]; then
        warn "No existe el directorio $ADDONS_DIR/extra"
        return
    fi
    
    for module in $(ls -d $ADDONS_DIR/extra/*/ 2>/dev/null | xargs -n 1 basename); do
        info "Instalando módulo EXTRA: $module"
        exec_in_web python3 /opt/odoo/odoo-core/odoo-bin \
            -c /etc/odoo/odoo.conf \
            --update=$module \
            --stop-after-init \
            --log-level=error 2>&1 | grep -E "ERROR|$module" || true
    done
    
    log "✅ Módulos EXTRA instalados"
}

install_enterprise_modules() {
    info "Instalando módulos ENTERPRISE encontrados en $ADDONS_DIR/enterprise..."
    
    if [ ! -d "$ADDONS_DIR/enterprise" ]; then
        warn "No existe el directorio $ADDONS_DIR/enterprise"
        return
    fi
    
    for module in $(ls -d $ADDONS_DIR/enterprise/*/ 2>/dev/null | xargs -n 1 basename); do
        info "Instalando módulo ENTERPRISE: $module"
        exec_in_web python3 /opt/odoo/odoo-core/odoo-bin \
            -c /etc/odoo/odoo.conf \
            --update=$module \
            --stop-after-init \
            --log-level=error 2>&1 | grep -E "ERROR|$module" || true
    done
    
    log "✅ Módulos ENTERPRISE instalados"
}

fix_whatsapp_module() {
    info "Verificando/Arreglando módulo website_whatsapp..."
    
    if [ -d "$ADDONS_DIR/oca/website_whatsapp" ]; then
        info "Módulo website_whatsapp encontrado en $ADDONS_DIR/oca/"
        
        exec_in_web python3 /opt/odoo/odoo-core/odoo-bin \
            -c /etc/odoo/odoo.conf \
            --update=website_whatsapp \
            --stop-after-init \
            --log-level=info 2>&1 | head -20
    fi
    
    exec_in_db psql -U $DB_USER -d $DB_NAME << EOF
    ALTER TABLE website ADD COLUMN IF NOT EXISTS whatsapp_text varchar DEFAULT '';
    INSERT INTO ir_model_fields (model, name, field_description, ttype, store, selectable)
    SELECT 'website', 'whatsapp_text', 'WhatsApp Text', 'char', True, True
    WHERE NOT EXISTS (SELECT 1 FROM ir_model_fields WHERE model='website' AND name='whatsapp_text');
    DELETE FROM ir_ui_view WHERE arch_db::text LIKE '%whatsapp%';
EOF
    
    log "✅ Campo whatsapp_text verificado/creado"
}

determine_addon_type() {
    local addon_path=$1
    local addon_name=$(basename "$addon_path")
    
    if [ -f "$addon_path/__manifest__.py" ]; then
        if grep -q "OCA" "$addon_path/__manifest__.py" 2>/dev/null || \
           [ -f "$addon_path/README.rst" ] && grep -q "OCA" "$addon_path/README.rst" 2>/dev/null || \
           [ -d "$addon_path/i18n" ] && ls "$addon_path/i18n/"*.po 2>/dev/null | grep -q "es_" || \
           [[ "$addon_name" =~ ^(web_|base_|account_|sale_|purchase_|stock_|hr_|project_|mrp_) ]]; then
            echo "oca"
            return
        fi
        
        if [[ "$addon_name" =~ (enterprise|_enterprise$) ]] || \
           grep -q "enterprise" "$addon_path/__manifest__.py" 2>/dev/null; then
            echo "enterprise"
            return
        fi
    fi
    
    echo "extra"
}

restore() {
    local dump_file=$1
    local INSTALL_MODULES=${2:-false}
    local ORIGINAL_DB_NAME=""
    
    if [ ! -f "$dump_file" ]; then
        error "Archivo no encontrado: $dump_file"
        exit 1
    fi
    
    local BASE_NAME=$(basename "$dump_file" | sed 's/odoo_db_//' | sed 's/\.dump//')
    local FILESTORE_FILE="$(dirname "$dump_file")/odoo_filestore_${BASE_NAME}.tar.gz"
    local ADDONS_FILE="$(dirname "$dump_file")/odoo_addons_${BASE_NAME}.tar.gz"
    
    info "Restaurando desde backup: $BASE_NAME"
    info "Base de datos destino: $DB_NAME"
    info "Directorio de backup: $(dirname "$dump_file")"
    
    # 1. Detener Odoo web
    info "Deteniendo Odoo web..."
    docker compose -f $COMPOSE_ODOO_FILE stop web
    
    # 2. Limpiar directorios de addons existentes
    info "Limpiando directorios de addons existentes..."
    sudo rm -rf $ADDONS_DIR/oca/* $ADDONS_DIR/extra/* $ADDONS_DIR/enterprise/* 2>/dev/null || true
    mkdir -p $ADDONS_DIR/{oca,extra,enterprise}
    
    # 3. Restaurar filestore
    if [ -f "$FILESTORE_FILE" ]; then
        info "Restaurando filestore..."
        
        local TEMP_RESTORE_DIR="/tmp/restore_$$"
        mkdir -p "$TEMP_RESTORE_DIR"
        
        tar --no-same-owner --no-same-permissions -xzf "$FILESTORE_FILE" -C "$TEMP_RESTORE_DIR"
        
        local FILESTORE_BASE=$(find "$TEMP_RESTORE_DIR" -type d -name "filestore" | head -1)
        
        if [ -n "$FILESTORE_BASE" ]; then
            ORIGINAL_DB_NAME=$(find "$FILESTORE_BASE" -maxdepth 1 -type d ! -path "$FILESTORE_BASE" | head -1 | xargs basename 2>/dev/null)
            
            if [ -n "$ORIGINAL_DB_NAME" ]; then
                info "Filestore original detectado: $ORIGINAL_DB_NAME"
                info "Renombrando a: $DB_NAME"
                
                sudo rm -rf $FILESTORE_DIR/$DB_NAME
                mkdir -p $FILESTORE_DIR
                sudo mv "$FILESTORE_BASE/$ORIGINAL_DB_NAME" "$FILESTORE_DIR/$DB_NAME"
                
                log "✅ Filestore restaurado"
            fi
        fi
        
        sudo rm -rf "$TEMP_RESTORE_DIR"
    else
        warn "No se encontró backup de filestore"
    fi
    
    # 3.1 Restaurar addons
    if [ -f "$ADDONS_FILE" ]; then
        info "Restaurando addons desde: $(basename $ADDONS_FILE)"
        
        local TEMP_ADDONS_DIR="/tmp/addons_restore_$$"
        mkdir -p "$TEMP_ADDONS_DIR"
        
        tar --no-same-owner --no-same-permissions -xzf "$ADDONS_FILE" -C "$TEMP_ADDONS_DIR"
        
        info "Buscando y clasificando addons..."
        
        local MODULES=$(find "$TEMP_ADDONS_DIR" -type f \( -name "__manifest__.py" -o -name "__openerp__.py" \) -exec dirname {} \; 2>/dev/null)
        
        if [ -n "$MODULES" ]; then
            for module_path in $MODULES; do
                local module_name=$(basename "$module_path")
                local addon_type=$(determine_addon_type "$module_path")
                
                info "Procesando módulo: $module_name (tipo: $addon_type)"
                
                local dest_dir="$ADDONS_DIR/$addon_type/$module_name"
                
                if [ -d "$dest_dir" ]; then
                    warn "Módulo $module_name ya existe, actualizando..."
                    sudo rm -rf "$dest_dir"
                fi
                
                sudo cp -r "$module_path" "$dest_dir"
                log "  ✅ Módulo $module_name restaurado en $addon_type/"
            done
        else
            warn "No se encontraron módulos Odoo en el backup de addons"
        fi
        
        sudo chown -R 1001:1001 $ADDONS_DIR/ 2>/dev/null || true
        sudo chmod -R 755 $ADDONS_DIR/
        
        sudo rm -rf "$TEMP_ADDONS_DIR"
        
        echo ""
        info "=== RESUMEN DE ADDONS RESTAURADOS ==="
        for type in oca extra enterprise; do
            if [ -d "$ADDONS_DIR/$type" ] && [ "$(ls -A $ADDONS_DIR/$type 2>/dev/null)" ]; then
                local count=$(ls -d $ADDONS_DIR/$type/*/ 2>/dev/null | wc -l)
                log "✅ $type: $count módulos"
                ls -d $ADDONS_DIR/$type/*/ 2>/dev/null | xargs -n 1 basename | head -5 | while read module; do
                    echo "   - $module"
                done
                if [ $count -gt 5 ]; then
                    echo "   ... y $((count - 5)) más"
                fi
            else
                warn "⚠️ $type: No se encontraron módulos"
            fi
        done
        echo ""
        
        log "✅ Addons restaurados en $ADDONS_DIR"
    else
        warn "No se encontró backup de addons: $ADDONS_FILE"
    fi
    
    # 4. Restaurar base de datos (MÉTODO CORREGIDO - Usando docker cp)
    info "Restaurando base de datos..."
    
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(exec_in_db cat /run/secrets/postgres_password 2>/dev/null || echo "")
    fi
    
    info "Eliminando base de datos existente..."
    exec_in_db psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME';" 2>/dev/null || true
    exec_in_db dropdb -U $DB_USER --if-exists $DB_NAME
    exec_in_db createdb -U $DB_USER $DB_NAME
    
    # Copiar dump al contenedor
    info "Copiando dump al contenedor..."
    docker cp "$dump_file" $DB_CONTAINER:/tmp/restore.dump
    
    info "Restaurando dump de base de datos..."
    set +e
    exec_in_db pg_restore \
        -U $DB_USER \
        -d $DB_NAME \
        --no-owner \
        --no-privileges \
        -v \
        /tmp/restore.dump 2>&1
    PG_EXIT=$?
    set -e
    
    # Limpiar
    exec_in_db rm -f /tmp/restore.dump
    
    if [ $PG_EXIT -eq 0 ]; then
        log "✅ Base de datos restaurada"
        
        if [ -n "$ORIGINAL_DB_NAME" ] && [ "$ORIGINAL_DB_NAME" != "$DB_NAME" ]; then
            info "Actualizando referencias al filestore..."
            exec_in_db psql -U $DB_USER -d $DB_NAME -c \
                "UPDATE ir_attachment SET store_fname = REPLACE(store_fname, '$ORIGINAL_DB_NAME', '$DB_NAME') WHERE store_fname LIKE '%$ORIGINAL_DB_NAME%';" \
                2>/dev/null || true
        fi
    else
        error "❌ Falló la restauración de la base de datos (código: $PG_EXIT)"
        exit 1
    fi
    
    # Ajustar permisos finales
    info "Ajustando permisos finales..."
    sudo chown -R 1001:1001 $DATA_DIR $WEB_DATA_DIR $LOGS_DIR 2>/dev/null || true
    sudo chmod -R 755 $DATA_DIR $WEB_DATA_DIR $LOGS_DIR 2>/dev/null || true

    # 5. Iniciar Odoo (con verificación)
    info "Iniciando Odoo web..."
    ensure_web_container
    
    # 6. Instalar módulos si se solicitó
    if [ "$INSTALL_MODULES" = true ]; then
        info "Instalando módulos adicionales..."
        fix_whatsapp_module
        install_oca_modules
        install_extra_modules
        install_enterprise_modules
        
        info "Reiniciando Odoo..."
        docker restart $WEB_CONTAINER
        sleep 10
    fi
    
    echo ""
    log "✅ RESTAURACIÓN COMPLETADA"
    info "Base de datos: $DB_NAME"
    info "Filestore: $FILESTORE_DIR/$DB_NAME"
    info "Addons: $ADDONS_DIR/{oca,extra,enterprise}"
    info "Accede a Odoo en: http://localhost:18069"
}

# Procesar argumentos
INSTALL_MODULES=false

case $1 in
    -l|--list)
        list_backups
        ;;
    -f|--file)
        if [ "$3" = "--install-modules" ]; then
            INSTALL_MODULES=true
        fi
        restore "$2" "$INSTALL_MODULES"
        ;;
    --install-modules)
        INSTALL_MODULES=true
        LATEST=$(ls -t $BACKUP_DIR/odoo_db_*.dump 2>/dev/null | head -1)
        if [ -z "$LATEST" ]; then
            error "No hay backups disponibles"
            exit 1
        fi
        restore "$LATEST" "$INSTALL_MODULES"
        ;;
    -h|--help)
        usage
        ;;
    *)
        LATEST=$(ls -t $BACKUP_DIR/odoo_db_*.dump 2>/dev/null | head -1)
        if [ -z "$LATEST" ]; then
            error "No hay backups disponibles en $BACKUP_DIR"
            exit 1
        fi
        restore "$LATEST" false
        ;;
esac