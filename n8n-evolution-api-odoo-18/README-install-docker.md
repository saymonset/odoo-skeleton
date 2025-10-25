 Instalación de Docker
Actualizar el índice de paquetes:

```bash
sudo apt update && sudo apt upgrade -y
```
# 2 Instalar dependencias necesarias
```bash
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
```
# 3 Agregar el repositorio oficial de Docker
```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg


echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  ```

  # 4  Instalar Docker Engine
  ```bash
  sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

# 5. Agregar tu usuario al grupo docker (para no usar sudo)
```bash
sudo usermod -aG docker $USER
newgrp docker
```

# 6. Verificar la instalación
```bash
 sudo docker --version
sudo docker compose version
```