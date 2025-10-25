
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

