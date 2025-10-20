## Renovar subdominios
# Listar todos los certificados con su dias validos
sudo certbot certificates

# Instalar esto para renovar
# Si no esta instalado, se instala
apt install python3-certbot-nginx

# Renovando examples 
sudo certbot --nginx -d n8n.jumpjibe.com
sudo certbot --nginx -d jumpjibe.com

## Paso 1: Aplicar SSL para un Solo Dominio
# Instrucciones para Configurar Certificados SSL

Ve a la carpeta `ssl-nginx` y abre el archivo `Personalizada-good-Como+configurar+certificados+SSL+HTTPS+en+dominio+Manualmente.txt`. Allí encontrarás algunas URL útiles y las instrucciones necesarias en ese archivo.

## Notas

- Asegúrate de seguir todas las instrucciones cuidadosamente.
- Si tienes alguna duda, consulta las URL proporcionadas en el archivo para obtener más ayuda.
