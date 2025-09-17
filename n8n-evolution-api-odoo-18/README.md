 # Copiar el archivo env-example a .env
 ```bash
 cp env-example .env
 ```

 # Execute given commands one by one to install Odoo
 # Creamos la red en docker
 ```
 docker network create odoo_network_${VERSION}
 ```
###
```bash
Asegurate que la variable de ambiente file este : .env
LLena las variables de ambiente en .env. La variable HOST , no se sta usando
```
### down :
```bash
docker-compose down 
```

### start :
```bash
docker-compose up -d
```

# Soluion de problemas
 Para forzar -i base la primera ves en odoo18 , coloca este comando y luego lo comntas
  command: "--db-filter=^dbodoo18$$ -i base"
# Si hay errores 
Carga tu archivo .env (si tienes uno)
source .env

Elimina los contenedores viejos y vuelve a crear
Cuando Docker Compose ya creó un contenedor roto, a veces hay que limpiarlo:

docker-compose down -v --remove-orphans
docker-compose up -d --build
