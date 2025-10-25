# Usa una imagen base de Python
FROM python:3.12-slim



# Cambia al usuario root
USER root

 


# Instalar paquetes necesarios del sistema
RUN apt-get update && apt-get install -y \
    wget \
    fontconfig \
    libxrender1 \
    libxext6 \
    wkhtmltopdf \
    xfonts-75dpi \
    xfonts-base \
    openssh-server \
    fail2ban \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libsasl2-dev \
    libldap2-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    default-libmysqlclient-dev \
    libpq-dev \
    libjpeg62-turbo-dev \
    liblcms2-dev \
    libblas-dev \
    libatlas-base-dev \
    git \
    curl \
    fontconfig \
    libxrender1 \
    xfonts-75dpi \
    xfonts-base \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# # Descargar e instalar libssl1.1 manualmente desde un repositorio alternativo
# RUN wget http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb \
#     && dpkg -i libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb \
#     && rm libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
#  # Descargar e instalar wkhtmltopdf desde una imagen precompilada
#     RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.focal_arm64.deb \
#     && dpkg -i wkhtmltox_0.12.6-1.focal_arm64.deb \
#     && apt-get install -y -f \
#     && rm wkhtmltox_0.12.6-1.focal_arm64.deb


# Configura el servidor SSH
RUN mkdir /var/run/sshd && echo 'root:root' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Crear un entorno virtual
RUN python3 -m venv /opt/venv

# Configurar el entorno virtual como predeterminado
ENV PATH="/opt/venv/bin:$PATH"

# Actualizar pip e instalar debugpy en el entorno virtual
RUN pip install --upgrade pip && \
    pip install debugpy

# Copiar el archivo de requisitos e instalar dependencias
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Copiar el código fuente de Odoo
COPY ./src/odoo-18 /opt/odoo


# Instalar Odoo desde el código fuente
RUN pip install /opt/odoo

# Deshabilitar la validación de archivos para evitar advertencias
ENV PYDEVD_DISABLE_FILE_VALIDATION=1

RUN apt-get update && apt-get install -y sudo

# Crea el usuario y grupo 'odoo'
RUN groupadd -r odoo && useradd -m -r -g odoo odoo
RUN usermod -aG sudo odoo
RUN echo "odoo ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers






# Copiar el script de entrada
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Crea los directorios necesarios y asigna permisos
RUN mkdir -p /opt/odoo /opt/venv \
    && chown -R odoo:odoo /opt/odoo /opt/venv /entrypoint.sh

# Usar el script de entrada para activar el entorno virtual
ENTRYPOINT ["/entrypoint.sh"]

# Comando predeterminado para iniciar Odoo con debugpy
CMD ["python3", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "odoo"]

# Cambia al usuario 'odoo'
#USER odoo
