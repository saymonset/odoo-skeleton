0.1 Identificamos el contenedor de la bd
```bash
docker ps
```
1. Entrar al Bash del Contenedor
```bash
docker exec -it odoo-db18 bash
```

1.1 Listamos las bd e identificamos cual va a ser el backup
 ```bash

 psql -U odoo -d postgres

 \l

 ```

 2.   CREAR LA BD
    ```bash
    CREATE DATABASE db0;
    ```
3. Salir de postgres
  ```bash
     \q
    ```
4. Salir del contenedor
  ```bash
     exit
    ```
5. Copiar del backup bd al contendor 
```bash
  docker cp /Users/simon/opt/odoo/cliente/jumpnjibe/bd/backup2023_03_19.sql odoo-db18:/tmp/backup.sql
  ```
6. Entrar al contenedor de bd postgres para restaurar la base de datos
```bash
docker exec -it odoo-db18 bash
```

7. Restaurar bd
```bash
psql -U odoo -d db0 -f /tmp/backup.sql
```
8. Entrar al portal. bd db0, usuario xxx, password xxx. Esto creara el directorio de docker: /root/.local/share/Odoo/filestore  
```bash 
  user: xxx
  password: xxx
  ```
9. Entrar al \ contenedor a verificar el filestore, si no existe lo creamos y buscamos en /root/.local/share/Odoo/filestore
```bash
docker exec -it odoo-18 bash
```
```bash
find / -type d -name "filestore"
```
10. salir del contenedor
```bash
exit
```
11.Copiar  el contenido filestore de la carpeta filestore/db0 a destino db0
```bash
docker cp /Users/simon/opt/odoo/cliente/jumpnjibe/filestore/db0/. odoo-18:/root/.local/share/Odoo/filestore/db0
```
12. restaurar contenedor de docker
```bash
 docker restart odoo-18
```
13. Acceder
```bash
http://localhost:18069/es
```
```bash
exit
```
