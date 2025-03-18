

# Instalamos odoo , postgres y usamos una nueva red en docker-compose
# Creación de la Red en Docker

Para crear una red en Docker, utiliza el siguiente comando:

```bash
docker network create odoo_network_antojitos
```
Configuración de Variables de Entorno
Asegúrate de que el archivo de variables de entorno se llame .env con copia de env-example.  Ten en cuenta que la variable HOST no se está utilizando.

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
