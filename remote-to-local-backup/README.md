Backup en remote y restaurar bd en local

En maquina Remota: Hacer Backup de la Base de Datos

0. Conectar a maquina remota
```bash
   ssh root@5.189.161.7
```
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
2. Crear el Dump de la Base de Datos
```bash
 pg_dump -U odoo db0 > /tmp/backup.sql
```
Si deseas crear un backup con un nombre específico, puedes usar:
```bash
 pg_dump -U odoo youtube > backup_2025_02_25_III.sql
```
3. Salir del contenedor
```bash
  \q
  \exit
  ```

3.1 Desde el remoto, saca lo de docker 
		Copiamos el backup que esta dentro del contenedor a nuestra maquina remota

```bash
  docker cp odoo-db18:/tmp/backup.sql ./backup.sql
``` 

4. Para copiar el backup.sql a tu maquina local:
Ubicate en tu maquina local

  ```bash
     scp -r root@5.189.161.7:/root/backup.sql /Users/simon/opt/odoo/cliente/jumpnjibe/bd/backup2023_03_19.sql
  ```
 4.1 Salir de postgres
 ```bash
 \q
 exit
 ```

Hacer Backup del Filestore de las Imágenes
El filestore de Odoo se encuentra en el directorio de tu instalación de Odoo. Generalmente, se ubica en: ~/.local/share/Odoo/filestore/<nombre_base_datos> También puedes encontrar la ubicación en el archivo de configuración odoo.conf, donde se especifica como data_dir o filestore. Debes copiar este directorio a la misma ubicación donde guardaste el backup de la base de datos.

Ejemplo de Configuración
      data_dir = /var/lib/odoo/.local/share/Odoo
      filestore = /root/.local/share/Odoo/filestore  


0. Conectar a maquina remota
```bash
   ssh root@5.189.161.7
```
0.1 Identificamos el contenedor de odoo
```bash
docker ps
```
1. Entrar al Bash del Contenedor
```bash
docker exec -it odoo-18 bash
```      



2. Navegar a la Ruta del Filestore. Una de las dos direcciones funciona
 ```bash
 cd  /root/.local/share/Odoo/filestore  
 cd /var/lib/odoo/.local/share/Odoo
 ```

3. salir del contenedor
  ```bash
    exit
  ```  
5. sacar el Filestore del docker a tu Máquina remota dentro de la maquina remota
 ```bash
 docker cp  odoo-18:/root/.local/share/Odoo/filestore/db0 db0
 ```

 4. Para copiar el filestore a tu maquina local:
Ubicate en tu maquina local

  ```bash
     scp -r root@5.189.161.7:/root/db0 /Users/simon/opt/odoo/cliente/jumpnjibe/filestore/db0
  ```
 