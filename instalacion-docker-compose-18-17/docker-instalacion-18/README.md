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
