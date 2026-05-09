# ============================
# Dockerfile Odoo 18 + wkhtmltopdf FIX Debian 13
# ============================

FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/opt/venv/bin:$PATH"
ENV ODOO_RC=/etc/odoo/odoo.conf
ENV PYDEVD_DISABLE_FILE_VALIDATION=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2-dev libxslt1-dev zlib1g-dev \
    libsasl2-dev libldap2-dev build-essential \
    libffi-dev default-libmysqlclient-dev \
    libpq-dev libjpeg62-turbo-dev liblcms2-dev \
    libblas-dev liblapack-dev git curl fontconfig \
    libxrender1 libxext6 xfonts-75dpi xfonts-base \
    libfreetype6 libfontconfig1 libjpeg62-turbo \
    postgresql-client xz-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar libssl1.1 (necesaria para wkhtmltopdf)
RUN curl -L --fail --silent --show-error \
      -o /tmp/libssl1.1.deb \
      http://archive.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1w-0+deb11u1_amd64.deb \
    && dpkg -i /tmp/libssl1.1.deb || apt-get install -fy \
    && rm /tmp/libssl1.1.deb

# Instalar wkhtmltopdf
RUN curl -L --fail --silent --show-error \
      -o /tmp/wkhtml.deb \
      https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_amd64.deb \
    && dpkg -x /tmp/wkhtml.deb /tmp/wk \
    && mv /tmp/wk/usr/local/bin/wkhtmltopdf /usr/local/bin/ \
    && mv /tmp/wk/usr/local/bin/wkhtmltoimage /usr/local/bin/ \
    && chmod +x /usr/local/bin/wkhtmltopdf /usr/local/bin/wkhtmltoimage \
    && rm -rf /tmp/wkhtml.deb /tmp/wk

# Crear usuario Odoo (UID 1001)
RUN groupadd -g 1001 odoo && \
    useradd -u 1001 -g odoo -m -d /opt/odoo odoo

# Instalar sudo y permitir a odoo ejecutar comandos sin contraseña
RUN apt-get update && apt-get install -y sudo && rm -rf /var/lib/apt/lists/*
RUN echo "odoo ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Crear entorno virtual
RUN python3 -m venv /opt/venv \
    && pip install --upgrade pip \
    && pip install debugpy

# Clonar Odoo 18 desde GitHub
RUN mkdir -p /opt/odoo/odoo-core && \
    git clone --depth 1 -b 18.0 https://github.com/odoo/odoo.git /opt/odoo/odoo-core && \
    chown -R odoo:odoo /opt/odoo/odoo-core

WORKDIR /opt/odoo

# Copiar e instalar dependencias Python adicionales (requirements.txt)
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# Instalar dependencias oficiales de Odoo
RUN pip install -r /opt/odoo/odoo-core/requirements.txt

# Copiar entrypoint y dar permisos de ejecución
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ============================================
# IMPORTANTE: NO cambiar a usuario odoo aquí.
# El entrypoint debe ejecutarse como root para poder ajustar permisos
# y luego cambiar a odoo con sudo.
# ============================================
# USER 1001   <--- COMENTADO

ENTRYPOINT ["/entrypoint.sh"]
CMD []