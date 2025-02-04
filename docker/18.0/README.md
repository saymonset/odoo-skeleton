 
 # Start a PostgreSQL server
###
```bash
  docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -e POSTGRES_DB=postgres --name db postgres:15
```  

### Crear imagen de docker para luegorear el contenedor

```bash
 docker build -t odooimgsaymon .
```
 # Arrancar containerde docker
```bash
 docker run -v /Users/simon/opt/odoo/odoo-skeleton/docker/18.0/addons:/mnt/extra-addons  -p 8069:8069 --name odoo18container --link db:db -t odooimgsaymon
```
 # Eliminar container de docker
 ```bash
  docker rm odoo18container 
  ```
