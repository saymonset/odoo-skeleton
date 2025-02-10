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
 docker build -t odooimgsaymon:18 .
```

 # Eliminar container de docker
 ```bash
  docker rm odoo18container 
  ```

 # Arrancar containerde docker
```bash
#Arreglar*********************
# falla
docker run -v /Users/simon/opt/odoo/odoo-skeleton/docker/18.0/config:/etc/odoo \
  -p 8069:8069 \
  --name odoo18container \
  --network odoo_network \
  --link db:db \
  odooimgsaymon:18


 #----------------------------------- 
  #Funciona
  docker run -v /Users/simon/opt/odoo/odoo-skeleton/docker/18.0/addons:/mnt/extra-addons \
  -p 8069:8069 \
  --name odoo18container \
  --network odoo_network \
  --link db:db \
  -e HOST=db \
  -e PORT=5432 \
  -e USER=odoo \
  -e PASSWORD=odoo \
  odooimgsaymon:18

```
