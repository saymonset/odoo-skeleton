 
# Copiar la Carpeta docker-instalacion-18 desde la Máquina Local a Digital Ocean en /root/odoo
#Sal donde estas y ubicate en paralelo a la carpeta odoo_subdominios
Para Windows
```bash
scp -rv odoo-subdominios root@5.189.161.7:/root/odoo
```
Para Linux/Mac
```bash
rsync -avz odoo-subdominios root@5.189.161.7:/root/odoo
```



# Para detener los contenedores en ejecución, utiliza el siguiente comando:
```bash
docker-compose down
```

# Para iniciar los contenedores en segundo plano, utiliza el siguiente comando:
```bash
docker-compose up -d
```
