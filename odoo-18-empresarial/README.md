# Video de ayuda para debuguear con odoo

https://www.youtube.com/watch?v=9qy8a5Kuq1Q

# VSCode + Docker para el desarrollo en Odoo con completado inteligente
0. Create la red:   
```bash
  docker network create odoo18_enterprice_network
 ```
```bash
Renombrar env copy a .env y modificar variables de ambiente si es necesario
```
0.1 5. Compilar la imagen de docker con el fichero Dockerfile.
```bash
 docker build -t odooenterprice:18 .
 ```
 Extra info: 
Create la imagen con docker file que la necesita docker-compose a l hora de correr.
Sustituye la version ${ODOO_VERSION} por la que vallas usar
```bash
  docker build -t odooenterprice:${ODOO_VERSION} .
```
2.1. En la carpeta vscode_backup_debug, copiate el archivo launch.json  la carp[eta .vscode. Si no existe .vscode, crea esa carpeta]    

3. Crear el espacio de trabajo importando el código fuente de Odoo. Esta en src
4. Configurar y modificar el fichero pyrightconfig.json para que apunte a los  fuentes de odoo y hacer debugger
6. Configurar las variables en el .env. Si no existe, esta una copia de env copy, reemplazarla .venv y poner las variables de entorno
8. ejecutar el docker compose con boton  derecho del raton o:  docker-compose up
```bash
docker-compose up
```
9. Ir a http://localhost:8069/ y loguearsde conmo super usuario en elogin super usuario. 
 user: admin,  passwd: admin


Ejemplo:

```json
{
  "name": "Docker Odoo Attach",
  "type": "debugpy",
  "request": "attach",
  "connect": {
    "host": "0.0.0.0",
    "port": 8888
  },
  "pathMappings": [
    {
      "localRoot": "${workspaceFolder}/src/odoo-18/addons",
      "remoteRoot": "/var/lib/odoo/custom_addons"
    },
    {
      "localRoot": "${workspaceFolder}/src/odoo-18/addons",
      "remoteRoot": "/var/lib/odoo/odoo/addons"
    }
  ]
}
```
-------Otras----------
1. Instalar VSCode de su página oficial - <https://code.visualstudio.com>
2. Instalar extensiones en vscode para la productividad:

   - Odoo IDE
     <https://marketplace.visualstudio.com/items?itemName=trinhanhngoc.vscode-odoo>
   - Odoo Shortcuts
     <https://marketplace.visualstudio.com/items?itemName=mvintg.odoo-file>
   - Owl Vision <https://marketplace.visualstudio.com/items?itemName=Odoo.owl-vision>

