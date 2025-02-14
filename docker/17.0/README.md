 # Creamos la red en docker
 ```
 docker network create odoo_network
 ```
 
 # Start a PostgreSQL server
###
```bash
docker run -p 5433:5432 -d \
  -e POSTGRES_USER=odoo \
  -e POSTGRES_PASSWORD=odoo \
  -e POSTGRES_DB=postgres \
  --name db \
  --network odoo_network \
  postgres:15
```  

### Crear imagen de docker para luegorear el contenedor

```bash
 docker build -t odooimgsaymon:17 .
```
# Create un rol especifico para el de odoo en postgres
 ```
  docker exec -it db bash

  psql -U odoo -d postgres

  CREATE USER odoo17 WITH PASSWORD 'odoo';
  ALTER USER odoo17 WITH SUPERUSER;

 ```
 # Arrancar archivo configuracion
 ```bash
docker run -v /Users/simon/opt/odoo/odoo-skeleton/docker/17.0/config:/etc/odoo \
-p 17069:8069 \
--name odoo17container \
--network odoo_network \
--link db:db \
--user 0:0 \
-t odooimgsaymon:17

 ```
 # Arrancar container de docker crudo
```bash

docker run -v /Users/simon/opt/odoo/odoo-skeleton/docker/17.0/addons:/mnt/extra-addons \
  -p 17069:8069 \
  --name odoo17container \
  --network odoo_network \
  --link db:db \
  -e HOST=db \
  -e PORT=5432 \
  -e USER=odoo17 \
  -e PASSWORD=odoo \
  -e DATABASE=db_17 \
  odooimgsaymon:17
```
 # Eliminar container de docker
 ```bash
  docker rm odoo17container 
  ```
