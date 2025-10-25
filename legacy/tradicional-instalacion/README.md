 # Execute given commands one by one to install Odoo

### Cambiar password de root:
```bash
passwd
```
 
### Crear usuario odoo:
```bash
sudo adduser odoo
```
```bash
sudo usermod -aG sudo odoo
```
```bash
su odoo
```
```bash
cd ~
```
```bash
sudo apt update
```
 
### Run the following commands to install the main dependencies:
```bash
sudo apt install openssh-server fail2ban python3-pip python3-dev libxml2-dev libxslt1-dev zlib1g-dev libsasl2-dev libldap2-dev build-essential libssl-dev libffi-dev libmysqlclient-dev libpq-dev libjpeg8-dev liblcms2-dev libblas-dev libatlas-base-dev git curl python3-venv  fontconfig libxrender1 xfonts-75dpi xfonts-base -y
```

### Download and install wkhtmltopdf:
```bash
 wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.jammy_amd64.deb
 ```
 ```bash
 sudo dpkg -i wkhtmltox_0.12.6.1-2.jammy_amd64.deb
 ```
 ```bash
 sudo apt-get install -f
```

### Now, install and configure PostgreSQL database:
```bash
  sudo apt install postgresql -y
  ```
   ```bash
  sudo su postgres
  ```
   ```bash
  psql
  ```
   ```bash
  CREATE ROLE odoo WITH LOGIN PASSWORD 'odoo' CREATEDB;
  ```
   ```bash
  \q
  exit

```

### Git onfiguramos
```bash
  git config --global user.name saymonset
  ```
   ```bash
  git config --global user.email saymon_set@hotmail.com.com

```

### Create one directory per instance:
```bash
 mkdir -p ~/odoo-dev/projectname
 ```
  ```bash
 cd ~/odoo-dev/projectname

```

### Create a Python virtual environment in a subdirectory called env/:
```bash
  python3 -m venv env

```

### Create some subdirectories, as follows:
```bash
  mkdir -p src local bin filestore logs

```

### Clone Odoo and install the requirements:
```bash
  git clone -b 17.0 --single-branch --depth 1 https://github.com/odoo/odoo.git src/odoo
  ```
   ```bash
  env/bin/pip3 install -r src/odoo/requirements.txt

```

### Save the following shell script as bin/odoo:
# The name file is odoo alone
 ```bash
 vi bin/odoo
 ```
 # Page this in new file call odoo
```bash
    #!/bin/sh
    ROOT=$(dirname "$0")/..
    PYTHON="$ROOT/env/bin/python3"
    ODOO="$ROOT/src/odoo/odoo-bin"
    $PYTHON $ODOO -c "$ROOT/projectname.cfg" "$@"
    exit $?
```
 ```bash
$ chmod +x bin/odoo
```

### Create an empty dummy local module:
```bash
     mkdir -p local/dummy
         touch local/dummy/__init__.py
         echo '{"name": "dummy", "installable": False}' >local/dummy/__manifest__.py
```
### Generate a configuration file for your instance:
```bash
      bin/odoo --stop-after-init --save --addons-path src/odoo/odoo/addons,src/odoo/addons,local --data-dir filestore
```

### Add a .gitignore file with given content:
```
  vi .gitignore

  # dotfiles, with exceptions:
.*
!.gitignore
# python compiled files
*.py[co]
# emacs backup files
*~
# not tracked subdirectories
/env/
/src/
/filestore/
/logs/
```


### Create conf file in src/odoo/odoo.cfg :

 ```bash
vi src/odoo/odoo.cfg
```
 ```bash
[options]
addons_path = /home/odoo/odoo-dev/projectname/src/odoo/addons,/home/odoo/odoo-dev/projectname/local
admin_passwd = 1 
csv_internal_sep = ,
data_dir = /home/odoo/.local/share/Odoo
db_host = 0.0.0.0
db_maxconn = 64
db_maxconn_gevent = False
db_name = saymondb
db_user = odoo
db_password = odoo
db_port = 5432
db_sslmode = prefer
#db_sslmode = require
db_template = template0
dbfilter = .*
demo = {}
email_from = False
from_filter = False
geoip_city_db = /usr/share/GeoIP/GeoLite2-City.mmdb
geoip_country_db = /usr/share/GeoIP/GeoLite2-Country.mmdb
gevent_port = 8072
http_enable = True
http_interface = 
http_port = 8069
import_partial = 
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_request = 65536
limit_time_cpu = 60
limit_time_real = 120
limit_time_real_cron = -1
list_db = True
log_db = False
log_db_level = warning
log_handler = :INFO
log_level = debug
logfile = 
max_cron_threads = 2
osv_memory_count_limit = 0
pg_path = 
pidfile = 
proxy_mode = False
reportgz = False
screencasts = 
screenshots = /tmp/odoo_tests
server_wide_modules = base,web
smtp_password = False
smtp_port = 25
smtp_server = localhost
smtp_ssl = False
smtp_ssl_certificate_filename = False
smtp_ssl_private_key_filename = False
smtp_user = False
syslog = False
test_enable = False
test_file = 
test_tags = None
transient_age_limit = 1.0
translate_modules = ['all']
unaccent = False
upgrade_path = 
websocket_keep_alive_timeout = 3600
websocket_rate_limit_burst = 10
websocket_rate_limit_delay = 0.2
without_demo = False
workers = 0
x_sendfile = False
```

### run odoo :
 ```bash
source env/bin/activate
```
 ```bash
 cd src/odoo
 ```
  ```bash
 ./odoo-bin -d saymondb -c odoo.cfg 
```
#Correr para depurar
Instale primero estas dos librerias
```
pip3 install inotify

pip3 install watchdog
```
```
 ./odoo-bin -d saymondb -c odoo.cfg  --dev=all
```

