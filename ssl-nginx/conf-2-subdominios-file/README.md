## Archivo de configuracion de un  dominio y un subdominio en ngnix 
# Se debe crear el certificado para el subdominio, en este caso es: antojitos.jumpjibe.com

# El certificado  antojitos.jumpjibe.com tiene problemas para renovarlo.

# Trata de sustituirlo por el cerrificado principal, en este caso es : jumpjibe.com. (Por hacer. TODO)

```bash
sudo certbot certonly --agree-tos --email admin@jumpjibe.com --webroot -w /var/www/html -d antojitos.jumpjibe.com
```

1. Verificar la Ubicación de los Certificados
Por defecto, Certbot almacena los certificados en el directorio /etc/letsencrypt/live/. Cada dominio para el que has solicitado un certificado tendrá su propio subdirectorio en esta ubicación. Puedes listar los certificados ejecutando el siguiente comando en la terminal:
# Listar certificados
```bash
ls /etc/letsencrypt/live/
```

2. Detalles del certificado
```bash
sudo openssl x509 -in /etc/letsencrypt/live/antojitos.jumpjibe.com/fullchain.pem -text -noout
```
3. Chequear fecha de expiracion
```bash
sudo certbot certificates
```

4. Renovación Automática: 
```bash
sudo certbot renew --dry-run
```
5. Programar Renovaciones: Si deseas asegurarte de que la renovación se realice sin problemas, puedes agregar un cron job manualmente. Abre el archivo de cron con:
bash

```bash
sudo crontab -e
```
Luego, agrega la siguiente línea para que Certbot intente renovar los certificados diariamente:
```bash
0 0 * * * certbot renew --quiet
```
Esto ejecutará el comando de renovación todos los días a la medianoche.