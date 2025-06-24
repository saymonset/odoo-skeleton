#Lista los certificados
sudo certbot certificates

#Para renovar el princi[al'

0-) # Borramos los certificados vencidos
sudo certbot delete --cert-name jumpjibe.com

Generamos de nuevo el certifcado
1-) sudo certbot certonly --agree-tos --email admin@jumpjibe.com --webroot -w /var/lib/letsencrypt/ -d jumpjibe.com -d www.jumpjibe.com





# Para generar certificados a subdominio, debes prmero ir a

1-) /etc/nginx/sites-available
2-) hacer backup y luego editar jumpjibe.com.conf
3-) borrar el subdominio paraque no apunte al certificado
4-) 
sudo certbot delete --cert-name antojitos.jumpjibe.com
5-) ejecutar : sudo systemctl restart nginx 
6-) asegurarse que funciona bien el nginx
7-) generar el certificado
sudo certbot certonly --agree-tos --email admin@jumpjibe.com.com --webroot -w /var/lib/letsencrypt/ -d antojitos.jumpjibe.com 

8-) borrar el  jumpjibe.com.conf y renombrar el backup al original
 



--extra informacion ....

sudo certbot delete --cert-name horebcorporation.jumpjibe.com
sudo certbot certonly --agree-tos --email admin@antojitos.jumpjibe.com.com --webroot -w /var/lib/letsencrypt/ -d horebcorporation.jumpjibe.com.conf


sudo certbot certonly --webroot -w /var/lib/letsencrypt/ -d antojitos.jumpjibe.com 
sudo certbot certonly --agree-tos --email admin@jumpjibe.com.com --webroot -w /var/lib/letsencrypt/ -d antojitos.jumpjibe.com 

sudo certbot certonly --agree-tos --email admin@jumpjibe.com.com --webroot -w /var/lib/letsencrypt/ -d horebcorporation.jumpjibe.com 

