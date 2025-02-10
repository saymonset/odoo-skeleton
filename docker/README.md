Start a PostgreSQL server
'''
$ docker run -d -v odoo-db:/var/lib/postgresql/data -p 5432:5432 -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -e POSTGRES_DB=postgres --name db postgres:15
'''

un Odoo with a custom configuration
The default configuration file for the server (located at /etc/odoo/odoo.conf) can be overriden at startup using volumes. Suppose you have a custom configuration at /path/to/config/odoo.conf, then

```
 docker run -v /path/to/config:/etc/odoo -p 8069:8069 --name odoo --link db:db -t odoo
 ```