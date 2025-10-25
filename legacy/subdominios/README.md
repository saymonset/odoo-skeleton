# Ejemplo de Configuración de un Subdominio en Odoo 18

## Instalación de Subdominios con SSL

En la carpeta `odoo_subdominios`, encontrarás la plantilla para instalar subdominios con SSL. El archivo `jumpjibe.com.conf tiene la nueva configuracion del nuevo subdominio` y su direccion en el servidor remoto es para el ngnix: /etc/nginx/sites-available/jumpjibe.com.conf la nueva configuracion del nuevo subdominio:
horebcorporation




# Debes configurar el ssl. Ir a la carpeta githuib ssl-nginx/conf-2-subdominios-file en como 
# configurar tu ssl example:
sudo certbot certonly --agree-tos --email admin@jumpjibe.com --webroot -w /var/www/html -d horebcorporation.jumpjibe.com

Paralevantar o restart el ngnix es 
```bash
sudo systemctl start nginx
```
## Descripción General

Esta carpeta es un ejemplo de cómo configurar un subdominio en Odoo 18, utilizando un dominio principal que ya está en funcionamiento. A continuación, se describen los aspectos clave de la configuración:

- **Variables de Entorno**: Se adaptan las variables de entorno para evitar conflictos con los puertos que están en uso por otros subdominios.
  
- **Configuración de Docker Compose**: Se configura `docker-compose` para utilizar variables que no interfieran con otros puertos. Esto asegura que cada subdominio funcione de manera independiente.

- **Redes Separadas**: Se utiliza una nueva red para instalar la base de datos y la aplicación, separándolas de otras redes. Esto previene conflictos en la comunicación entre la base de datos y la aplicación.
