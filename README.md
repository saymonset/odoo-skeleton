# Creamos una carpeta src
# Dentrro de ella bajamos los fuentes de odoo
```bash
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo/odoo.git odoo-18
git clone -b 18.0 --single-branch --depth 1 https://github.com/odoo-ide/odoo-stubs.git

```

# Asi debe de estar comentada el debugger y comentada la por defaul de odoo
# Comando por defecto: arrancar Odoo
```bash
#CMD ["python", "-Xfrozen_modules=off", "-m", "odoo"]
```
# Para depuración con debugpy:
```bash
CMD ["python", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "odoo"]
```
# Creamos la imagen de odoo en doxker personalizada
```bash
 docker image rm odoo-pers:18  --force
 docker rm odoo-pers-18
 docker build -t odoo-pers:18 .
 ```

 # Sio hay error  ERROR dbodoo18 odoo.modules.loading: Database dbodoo18 not initialized, you can force it with `-i base` 
 # descomente , corra y comentela linea de docker-compose 
 ```bash
command: ["python", "-Xfrozen_modules=off", "-m", "odoo", "--db-filter=^dbodoo18$$", "-i", "base"]
 ```
