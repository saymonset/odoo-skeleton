# Imagen base Python 3.12 slim
FROM python:3.12-slim

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
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
    liblapack-dev \
    git \
    curl \
    fontconfig \
    libxrender1 \
    xfonts-75dpi \
    xfonts-base \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Crear entorno virtual
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Instalar pip y debugpy
RUN pip install --upgrade pip \
    && pip install debugpy

# Copiar requirements e instalar dependencias
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Copiar código de Odoo
WORKDIR /opt/odoo
COPY ./src/odoo-18 /opt/odoo

# Instalar Odoo como paquete
RUN pip install .

# Variables de entorno útiles
ENV PYDEVD_DISABLE_FILE_VALIDATION=1
ENV ODOO_RC=/etc/odoo/odoo.conf

# Copiar entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Por defecto: arrancar Odoo con debugpy
CMD ["python", "-Xfrozen_modules=off", "-m", "odoo"]
#CMD ["python", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "odoo"]
