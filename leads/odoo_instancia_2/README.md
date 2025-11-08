# Crear estructura de carpetas
mkdir -p odoo_instancia_2/secrets odoo_instancia_2/v18_2/{config,odoo-web-data,addons/{extra,oca,enterprise},logs,filestore,pgdata/{data,init}}

# Navegar al directorio
cd odoo_instancia_2
rm -f v18_2/pgdata/init/01-create-user.sql

# Limpiar datos de PostgreSQL para empezar fresco
sudo rm -rf v18_2/pgdata/data

# Crear directorio init vacío
mkdir -p v18_2/pgdata/init