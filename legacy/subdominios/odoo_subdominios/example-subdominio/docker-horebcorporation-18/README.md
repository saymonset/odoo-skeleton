

# Instalamos odoo , postgres y usamos una nueva red en docker-compose
# Creación de la Red en Docker

Configuración de Variables de Entorno
# Asegúrate de que el archivo de variables de entorno se llame .env con copia de env-example.  Ten en cuenta que la variable HOST no se está utilizando.

Para crear una red en Docker, utiliza el siguiente comando:

```bash
docker network create odoo_network_horebcorporation
```


Detener los Contenedores
Para detener los contenedores en ejecución, utiliza el siguiente comando:

```bash
docker-compose down
```

Iniciar los Contenedores
Para iniciar los contenedores en segundo plano, utiliza el siguiente comando:
```bash
docker-compose up -d
```

 El archivo `jumpjibe.com.conf tiene la nueva configuracion del nuevo subdominio` y su direccion en el servidor remoto es para el ngnix: /etc/nginx/sites-available/jumpjibe.com.conf la nueva configuracion del nuevo subdominio:

```bash 
mv /etc/nginx/sites-available/jumpjibe.com.conf /etc/nginx/sites-available/jumpjibe.com.confcopydate
cp jumpjibe.com.conf /etc/nginx/sites-available
```
