# Ejemplo de Configuración de un Subdominio en Odoo 18

## Instalación de Subdominios con SSL

En la carpeta `odoo_subdominios`, encontrarás la plantilla para instalar subdominios con SSL. El archivo `nginx.conf` es de la instalacion que se hizo sin docker yesta detenido el servicio con: sudo systemctl stop nginx. Las carpetas y demás archivos son un modelo de cómo deben estar organizados.

## Descripción General

Esta carpeta es un ejemplo de cómo configurar un subdominio en Odoo 18, utilizando un dominio principal que ya está en funcionamiento. A continuación, se describen los aspectos clave de la configuración:

- **Variables de Entorno**: Se adaptan las variables de entorno para evitar conflictos con los puertos que están en uso por otros subdominios.
  
- **Configuración de Docker Compose**: Se configura `docker-compose` para utilizar variables que no interfieran con otros puertos. Esto asegura que cada subdominio funcione de manera independiente.

- **Redes Separadas**: Se utiliza una nueva red para instalar la base de datos y la aplicación, separándolas de otras redes. Esto previene conflictos en la comunicación entre la base de datos y la aplicación.
