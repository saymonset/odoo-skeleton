3. Preparar las bases de datos
Postiz y Temporal necesitan sus propias bases de datos dentro de PostgreSQL. Debes crearlas manualmente (una sola vez) antes de levantar los contenedores. Conéctate a tu PostgreSQL y ejecuta, EJEMPLO:
sql
CREATE DATABASE postiz;
CREATE DATABASE temporal;

# Aqui como se debe instalar para docker

# Entrar en docker bd
```bash
docker exec -it odoo-db18-n8n bash
psql -U odoo -d dbodoo18
CREATE DATABASE postiz;
CREATE DATABASE temporal;
```