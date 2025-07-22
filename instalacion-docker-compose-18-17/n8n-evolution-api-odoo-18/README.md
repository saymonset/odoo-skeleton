 # Copiar el archivo env-example a .env
 ```bash
 cp env-example .env
 ```
 # Copiar del local al remmote el archivo docker compose
 ```bash
 scp /Users/simon/opt/odoo/odoo-skeleton/instalacion-docker-compose-18-17/docker-instalacion-18/docker-compose.yaml  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/docker-compose.yaml
```
# Ruta de la configuracion de los dominios y https en servidor remoto
```bash
/etc/nginx/sites-available
/etc/nginx/sites-available/jumpjibe.com.conf
```
# Copiar del remote al local el archivo de configuracion de dominio y subdomninios
 ```bash
 scp root@5.189.161.7:/etc/nginx/sites-available/jumpjibe.com.conf  /Users/simon/opt/odoo/odoo-skeleton/instalacion-docker-compose-18-17/n8n-evolution-api-odoo-18
```
#Generar ssl para subdominios, ejemplo file: generate-ssl-jumpjibe.com.conf
# Apuntar los nuevos 80 del subdoninio y subirlo nuevamente al remoto , borrando el remotojumpjibe.com.conf  y colocando el nuevo jumpjibe.com.conf. Example: 
# Subdominio para n8n (HTTP)
server {
    listen 80;
    server_name n8n.jumpjibe.com;

    return 301 https://n8n.jumpjibe.com$request_uri;  # Redirige a HTTPS
}
```bash
scp   /Users/simon/opt/odoo/odoo-skeleton/instalacion-docker-compose-18-17/n8n-evolution-api-odoo-18/jumpjibe.com.conf root@5.189.161.7:/etc/nginx/sites-available/jumpjibe.com.conf
```
# Generar certificados a subdominios n8n y evolution
```bash
sudo certbot certonly --agree-tos --email admin@n8n.jumpjibe.com --webroot -w /var/lib/letsencrypt/ -d n8n.jumpjibe.com
```
```bash
sudo certbot certonly --agree-tos --email admin@evolution.jumpjibe.com --webroot -w /var/lib/letsencrypt/ -d evolution.jumpjibe.com
```

# abrir puertos
```bash
sudo ufw allow 6379/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 5678/tcp
```
# Subir el archivo jumpjibe.com.conf con los ssl de los subdominios
# Ya funcionando
```bash
scp   /Users/simon/opt/odoo/odoo-skeleton/instalacion-docker-compose-18-17/n8n-evolution-api-odoo-18/jumpjibe.com.conf root@5.189.161.7:/etc/nginx/sites-available
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
