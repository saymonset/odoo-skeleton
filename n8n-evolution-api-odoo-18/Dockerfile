# ============================
# Dockerfile optimizado Odoo 18 + Python 3.12
# ============================

FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/opt/venv/bin:$PATH"
ENV ODOO_RC=/etc/odoo/odoo.conf
ENV PYDEVD_DISABLE_FILE_VALIDATION=1

# ----------------------------
# Instalar dependencias del sistema + wkhtmltopdf
# ----------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2-dev libxslt1-dev zlib1g-dev \
    libsasl2-dev libldap2-dev build-essential \
    libssl-dev libffi-dev default-libmysqlclient-dev \
    libpq-dev libjpeg62-turbo-dev liblcms2-dev \
    libblas-dev liblapack-dev git curl fontconfig \
    libxrender1 xfonts-75dpi xfonts-base \
    && curl -Lo /usr/local/bin/wkhtmltopdf \
       https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.6/wkhtmltopdf_0.12.6-1.standalone-amd64 \
    && chmod +x /usr/local/bin/wkhtmltopdf \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# Crear usuario odoo
# ----------------------------
RUN groupadd -r odoo && useradd -r -g odoo -m -d /opt/odoo odoo

# ----------------------------
# Crear entorno virtual y dependencias Python
# ----------------------------
RUN python3 -m venv /opt/venv \
    && pip install --upgrade pip \
    && pip install debugpy

# Copiar requirements.txt e instalar dependencias Python
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# ----------------------------
# Copiar código de Odoo
# ----------------------------
WORKDIR /opt/odoo
COPY ./src/odoo-18 /opt/odoo

# Dar permisos a usuario odoo
RUN chown -R odoo:odoo /opt/odoo

# Instalar Odoo como paquete
RUN pip install .

# ----------------------------
# Copiar entrypoint
# ----------------------------
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Cambiar a usuario no-root
USER odoo

ENTRYPOINT ["/entrypoint.sh"]

# Comando por defecto: arrancar Odoo
CMD ["python", "-Xfrozen_modules=off", "-m", "odoo"]
# Para depuración con debugpy:
# CMD ["python", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "odoo"]
