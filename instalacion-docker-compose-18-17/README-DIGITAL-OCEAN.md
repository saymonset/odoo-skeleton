# Instalación en DigitalOcean

## En maquina Local: Hacer Backup de la Base de Datos

### 1. Entrar al Bash del Contenedor
    ```bash
    docker exec -it pgdb bash
    ```
### 2. Crear el Dump de la Base de Datos
   ```bash
    pg_dump -U odoo youtube > /tmp/backup.sql
  ```
# Si deseas crear un backup con un nombre específico, puedes usar:    
   ```bash
    pg_dump -U odoo youtube > backup_2025_02_25_III.sql
  ```

### 3. Salir del contenedor
# 
  ```bash
    exit
  ```

### 4. Copiar el Backup a tu Máquina Local
 # fuera del contenedor copiamos el backup que esta dentro del contenedor a nuestra maquina local
      ```bash
      docker cp pgdb:/tmp/backup.sql ./backup.sql
      docker cp pgdb:/backup_2025_02_25_III.sql ./backup_2025_02_25_III.sql
      ```


# Hacer Backup del Filestore de las Imágenes

   El filestore de Odoo se encuentra en el directorio de tu instalación de Odoo. Generalmente, se ubica en:
     ~/.local/share/Odoo/filestore/<nombre_base_datos>
    También puedes encontrar la ubicación en el archivo de configuración `odoo.conf`, donde se especifica como `data_dir` o `filestore`. Debes copiar este directorio a la misma ubicación donde guardaste el backup de la base de datos.
### Ejemplo de Configuración
```ini
      data_dir = /var/lib/odoo/.local/share/Odoo
      filestore = /root/.local/share/Odoo/filestore  
```

## 1. Copiar el Filestore -> Entramos en el bash del container
  ```bash
      docker exec -it odoocontainer18 bash
  ```
## 2. Navegar a la Ruta del Filestore
     ```bash
     cd  /var/lib/odoo/.local/share/Odoo/filestore
     ```
## 3. salir del contenedor
      ```bash
        exit
      ```  
   
## 5. Copiar el Filestore a tu Máquina Local
     ```bash
     docker cp odoocontainer18:/var/lib/odoo/.local/share/Odoo/filestore/youtube youtubefilestore_II
     ```

# Digital Ocean

## Conexión a Digital Ocean

Siempre busca conectarte usando **password** en lugar de **SSH**, ya que es menos complicado. Usa este password de ejemplo:

```bash
502Bn£L[mMVf
```

# Conectate a digital ocean , te pedira tu password
```bash
ssh root@xxx.xxx.xxx.xxx
```

# Install Odoo 18 on Docker. 

## 1. Crear Carpeta para Odoo
```bash
mkdir odoo
```

## 2. Conexión a Digital Ocean
```bash
ssh root@xxx.xxx.xxx.xxx
```

# password
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
 

 # Copiar la Carpeta `docker-instalacion-18` desde la Máquina Local a Digital Ocean en `/root/odoo`

## Windows

Para copiar la carpeta en Windows, utiliza el siguiente comando:

```bash
scp -rv docker-instalacion-18 root@143.110.226.119:/root/odoo
```

Linux / Mac
Para copiar la carpeta en Linux o Mac, utiliza el siguiente comando:
```bash
rsync -avz docker-instalacion-18 root@143.198.138.195:/root/odoo
```

# digitl ocean . Siempre busca con password y no ssh, es menos complicado y usa este password example
```bash
502Bn£L[mMVf
```

 # Copiar el .env
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
  WINDOWS
```bash windows
scp -rv ./filestore root@143.198.138.195:/root
```
Linux / Mac
Para copiar la carpeta en Linux o Mac, utiliza el siguiente comando:
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









