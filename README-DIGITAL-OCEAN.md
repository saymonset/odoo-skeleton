# Instalacion en digitao ocean
####################### hacer BACKUP BD ###################################################################
 
# Entramos al bash del container
    ```bash
    docker exec -it pgdb bash
    ```
# Creamos el dump de bd
   ```bash
    pg_dump -U odoo youtube > /tmp/backup.sql
    pg_dump -U odoo youtube > backup_2025_02_25_III.sql
    ```

# Salimos del contenedor
   ```bash
    exit
    ```

# fuera del contenedor copiamos el backup que esta dentro del contenedor a nuestra maquina local
      ```bash
      docker cp pgdb:/tmp/backup.sql ./backup.sql
      docker cp pgdb:/backup_2025_02_25_III.sql ./backup_2025_02_25_III.sql
      ```


########################## hacer BACKUP FILESTORE DE LAS IMAGENES #############################################################

#  Copia el filestore: El filestore de Odoo se encuentra en el directorio de tu instalación de Odoo, generalmente en ~/.local/share/Odoo/filestore/<nombre_base_datos>    o en el file de configuracion odoo.conf  como data_dir o filestore,. Debes copiar este directorio a la misma ubicación donde guardaste el backup de la base de datos.
#  example:
      data_dir = /var/lib/odoo/.local/share/Odoo, filestore = /root/.local/share/Odoo/filestore  

      # Entramos en el bash del container
      ```bash
        docker exec -it odoocontainer18 bash
      ```
     # vamos a la ruta del filestore y verificamos donde esta el filestore llamado igual a la misma bd que creamos
     ```bash
     cd  /var/lib/odoo/.local/share/Odoo/filestore
     ```
     #salimos del contenedor
      ```bash
        exit
      ```  
   
     # Lo copiamos a la maquina local
     ```bash
     docker cp odoocontainer18:/var/lib/odoo/.local/share/Odoo/filestore/youtube youtubefilestore_II
     ```

 #################################################################################################################
 ######################################Digital Ocean##########################################################################
 #################################################################################################################


#digitl ocean . Siempre busca con password y no ssh, es menos complicado y usa este password example
```bash
502Bn£L[mMVf
```

# Conectate a digital ocean , te pedira tu password
ssh root@xxx.xxx.xxx.xxx


# Install Odoo 18 on Docker. Por reemplazar esto. No es seguro la fuente

# Creamos carpeta odoo
```bash
mkdir odoo
```

# digitl ocean . Siempre busca con password y no ssh, es menos complicado y usa este password example
# Conectate a digital ocean , te pedira tu password
```bash
ssh root@xxx.xxx.xxx.xxx
```

```bash
502Bn£L[mMVf
    ```
# Install Docker on Ubuntu
 ```bash
curl -fsSL https://get.docker.com/ | sh
```
# Install Docker Compose
```bash
apt install docker-compose -y
```

# creamos la carpeta odoo en digital ocean
 ```bash
  mkdir odoo
 ```
 # Entramos a la maquina local y nos dirigimos a la carpeta donde esta la carpeta docker-instalacion-18
 ```bash
 cd C:\opt-windows-simons\odoo\odoo-skeleton\instalacion-docker-compose-18-17
 ```
 
# Copiamos la carpeta docker-instalacion-18 desde la maquina local a digitl ocean en /root/odoo
--Windows
 ```bash
 scp -rv docker-instalacion-18 root@143.110.226.119:/root/odoo
```
 --Linux Mac
 ```bash
 rsync -avz docker-instalacion-18 root@143.198.138.195:/root/odoo
 ```
# digitl ocean . Siempre busca con password y no ssh, es menos complicado y usa este password example
```bash
502Bn£L[mMVf
```

 # Copiamos el .env
 ```bash
 cp env-example  .env
```


# Copiar bd de local al digital ocean
```bash windows
scp -rv ./backup_2025_02_25_III.sql root@143.198.138.195:/root
```
```bash Linux
rsync -avz ./backup_2025_02_25_III.sql root@143.198.138.195:/root
```

# copiar filestore de local al digital ocean
```bash windows
scp -rv ./filestore root@143.198.138.195:/root
```
```bash Linux
rsync -avz ./filestore root@143.198.138.195:/root
```
# digitl ocean . Siempre busca con password y no ssh, es menos complicado y usa este password example
```bash
502Bn£L[mMVf
```

 # Instalamos los container odoo-db18 y odoo-18 ejecutamos
 ```bash
 docker-compose up
 ```
# Conectate a digital ocean , te pedira tu password
```bash
ssh root@xxx.xxx.xxx.xxx
```
# En digital ocean entramos a su contenedor de bd ostgres para crear la base de datos
```bash
docker exec -it odoo-db18 bash
```

# Entramos a la bd postgres con usuario odoo
```bash
    psql -U odoo -d postgres
    ```

    # CREAMOS LA BD
    ```bash
    CREATE DATABASE db0;
```
# Salimos del contenedor de postgres
  ```bash
        \q
  ```      

# salimos del contendor
```bash
     exit
```     
# Copiamos del digital ocean al contendor la
  ```bash
    docker cp backup_2025_02_25_III.sql odoo-db18:/tmp/backup.sql
  ```  
# En digital ocean entramos a su contenedor de bd ostgres para crear la base de datos
```bash
docker exec -it odoo-db18 bash
```

# restore bd
```bash
psql -U odoo -d db0 -f /tmp/backup.sql
# Si falla, tomar esta instruccion
pg_restore -U odoo -d db0 /tmp/backup.sql
```

# salimos de postgres
```bash
exit
```
# accedemos para que cree el filestore y luego buscar su path en docker para reemplazarlo por el backup llamado 
# igual a la bd que se respaldo
```bash
http://143.198.138.195:18069/
```

# entramos al otro contenedor a verificar el filestore, si no existe lo creamos y buscamos   en /root/.local/share/Odoo/filestore
```bash
docker exec -it odoo-18 bash
```
# Localizamos los filestore para colocar la copia de nuetra maquina local
```bash
find / -type d -name "filestore"
```
```bash
cd /root/.local/share/Odoo/filestore
ls la
```
# NO DEBERIA DE PASAR----
#  No exiote lo creamos
```bash
mkdir -p /root/.local/share/Odoo/filestore
```


# salimos del contenedor
```bash
exit
```
# Copiamos el contenido filestore de la  carpeta youtubefilestore_IId  a destino db0
```bash
docker cp youtubefilestore_II/. odoo-18:/root/.local/share/Odoo/filestore/db0
```

# retauramos
```bash
 docker restart odoo-18
```
# accedemos'
```bash
http://143.198.138.195:18069/
```
# En  DNS records actualiza el A para la nueva ip del droplet a jumpjibe
```bash
jumpjibe.com
```









