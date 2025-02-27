# VSCode + Docker para el desarrollo en Odoo con completado inteligente

1. Instalar VSCode de su página oficial - <https://code.visualstudio.com>
2. Instalar extensiones en vscode para la productividad:

   - Odoo IDE
     <https://marketplace.visualstudio.com/items?itemName=trinhanhngoc.vscode-odoo>
   - Odoo Shortcuts
     <https://marketplace.visualstudio.com/items?itemName=mvintg.odoo-file>
   - Owl Vision <https://marketplace.visualstudio.com/items?itemName=Odoo.owl-vision>

3. Crear el espacio de trabajo importando el código fuente de Odoo. Esta en src/odoo-18

4. Configurar y modificar el fichero pyrightconfig.json para que apunte a los  fuentes de odoo y hacer debugger

# Configurar las variables en el .env
  Si no existe, esta una copia de env copy, reemplazarla .venv y poner las variables de entorno.El nombre del nuevo contenedor a crear sera con la imagen que se crea con dockerfile

# Crear imgen con el dockerFile. Dentro de DockerFile busca la instruccion 
    #  COPY ./src/odoo-18 /opt/odoo
   # y revisa que esten los fuentes en la carpeta de tu maquina  ./src/odoo-18 

# Compilar la imagen de docker con el fichero Dockerfile 
   ```bash
       docker build -t odoodev:18 .
   ```
# ejecutar el docker compose : Esto creara el conenedor odoodev:18 y el postgres:16.0
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
