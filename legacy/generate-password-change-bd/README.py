#Tener python instalado 
````bash
python generate_hash.py
````

Introduce la contraseña: admin
Hash generado: $pbkdf2-sha512$600000$WzH8iyUv2AezdshVOavFaA==$ukSLk+Xeq/mirhTj/TVnD+1lP1uEXXX9PreA5ozc8BMcUfAfmV+CnNTqREsslawkLsVZeoceOgFhdkeY81Z3Gg==



 # Entramos a postgres de docker
 ```bash
 docker exec -it odoo-db17 bash
 ```
 # Conectamos a la bd
 ````bash
 \c antojitosDB
 ````
 # Actualizamos la bd con la nueva contrasena creada con python
 ```bash
 update res_users set password='$pbkdf2-sha512$600000$WzH8iyUv2AezdshVOavFaA==$ukSLk+Xeq/mirhTj/TVnD+1lP1uEXXX9PreA5ozc8BMcUfAfmV+CnNTqREsslawkLsVZeoceOgFhdkeY81Z3Gg==' where id=2;
 ````
 