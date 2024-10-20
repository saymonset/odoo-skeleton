# odoo-skeleton
# odoo-skeleton
Skeleto para crear repositorios de odoo
1-) activar el ambiente
 source venv/bin/active

2-) run
  cd src/odoo
./runsaymon.sh





#Tips instalacion con docker


#Para comenzar odoo

# Creando la bd 

docker run -d \
  --name odoo-db \
  -e POSTGRES_USER=odoo \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=odoo_db \
  -p 5432:5432 \
  postgres:14.0
 
 # Entrar a bd pidiendo password con -W
   psql -U odoo -d odoo_db -W

   # Conectarse directamente
   psql -U odoo -d odoo_db

   # Esto te mostrará una lista de todas las bases de datos, y podrás confirmar que "odoo_db" está presente.
   psql -U odoo -l




 # Si no esta creado venv
0-) python3 -m venv venv

# Si ya esta  creado el venv
3-) source venv/bin/activate
4-) pip3 install -r requirements.txt
//La primera ves para instalar la base que son modulos
5-) ./odoo-bin -c odoo.conf -i base

//(No Primera vez ) Instalar despues que las base a sido instalada]
5.1-)    ./odoo-bin -d odoo -u all -c odoo.conf
