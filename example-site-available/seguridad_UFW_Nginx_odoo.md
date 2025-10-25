
# Obtén tu IP pública:
```bash
curl ifconfig.me
```


# Verifica el estado final:
```bash
sudo ufw status verbose
```

# 1. Eliminar reglas duplicadas
sudo ufw delete allow 22/tcp
sudo ufw delete allow 80/tcp from 147.93.179.254
sudo ufw delete allow 80/tcp  # Eliminar duplicado

# 2. Permitir SSH solo desde tu IP administrativa (reemplaza <TU_IP>)
sudo ufw allow from 147.93.179.254 to any port 22 proto tcp
sudo ufw limit ssh  # Limitar intentos de conexión SSH

# 3. Permitir HTTP y HTTPS para todos
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 4. Revisar el acceso al puerto 18069
# Si no es necesario, eliminar regla:
sudo ufw delete allow from 147.93.179.254 to any port 18069

# 5. Asegurar política por defecto
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 6. Activar UFW si no está activo
sudo ufw enable

# 7. Verificar estado final
sudo ufw status verbose

# ATAQUES REPETITIVOS BLOQUEAR   
# 1. Fail2Ban: Instalación y Configuración Básica
# Fail2Ban monitorea los logs de servicios (como SSH) y bloquea # # #automáticamente IPs que intentan ataques repetidos.
```bash
sudo apt update
sudo apt install fail2ban
```
# Configuración básica

# Crea el archivo jail.local vacio para activar la protección SSH y ajustar parámetros:
```bash
sudo vi /etc/fail2ban/jail.local
```

# Crea la sección [sshd], [DEFAULT] y asegúrate de que esté así:
```bash
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1 147.93.179.254

[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
backend  = systemd
```
# Guarda y cierra el archivo.
# Reinicia Fail2Ban para aplicar cambios:
```bash
sudo systemctl restart fail2ban
```
# Verificar estado y bans activos
```bash
sudo fail2ban-client status sshd
```
# Actualizaciones Regulares
```bash
sudo apt update
sudo apt upgrade -y
```
# Automatizar actualizaciones de seguridad
# Puedes instalar y configurar unattended-upgrades para que se apliquen automáticamente:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```
#  Auditoría de Seguridad Básica

# Revisar logs de acceso y errores
# Para SSH:
```bash
sudo tail -f /var/log/auth.log
```
# Para nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

# Escanear puertos abiertos
# Usa nmap para verificar qué puertos están expuestos:
```bash
sudo apt install nmap
nmap -sS -O localhost
```
# Herramientas adicionales
# Lynis: Auditoría de seguridad automatizada
```bash
sudo apt install lynis
sudo lynis audit system
```