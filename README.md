# README para la Instalación de Docker Compose 18-17

Este documento proporciona instrucciones para instalar la carpeta `instalacion-docker-compose-18-17` en un servidor Digital Ocean y aplicar SSL para un solo dominio.

## Requisitos Previos

- Tener acceso a un servidor Digital Ocean.
- Tener instalado Docker y Docker Compose en el servidor.
- Un dominio registrado que apunte a la dirección IP de tu servidor.

## Paso 1: Ir a la carpeta: instalacion-docker-compose-18-17 y  Leer el Archivo `README-DIGITAL-OCEAN.md`

Antes de proceder con la instalación, es importante revisar el archivo `README-DIGITAL-OCEAN.md` que contiene información esencial sobre la configuración y el uso de Digital Ocean.

```bash
cat README-DIGITAL-OCEAN.md
```


## Paso 2: Aplicar SSL para un Solo Dominio
# Instrucciones para Configurar Certificados SSL

Ve a la carpeta `ssl-nginx` y abre el archivo `Personalizada-good-Como+configurar+certificados+SSL+HTTPS+en+dominio+Manualmente.txt`. Allí encontrarás algunas URL útiles y las instrucciones necesarias en ese archivo.

## Notas

- Asegúrate de seguir todas las instrucciones cuidadosamente.
- Si tienes alguna duda, consulta las URL proporcionadas en el archivo para obtener más ayuda.

## TIPS

# README para la Transferencia de Archivos Odoo

Este documento proporciona instrucciones sobre cómo transferir archivos de un servidor remoto a un directorio local utilizando el comando `scp`.

## Comando de Transferencia

Para copiar de manera recursiva el directorio `odoo_subdominios` desde el servidor remoto a tu máquina local, utiliza el siguiente comando:

```bash
scp -r root@5.189.161.7:/root/odoo/odoo_subdominios /Users/simon/opt/odoo/odoo-skeleton