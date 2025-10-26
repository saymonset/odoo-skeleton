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
# Crear usuario Odoo con UID/GID 1001
# ----------------------------
RUN groupadd -g 1001 odoo && \
    useradd -u 1001 -g odoo -m -d /opt/odoo odoo

# ----------------------------
# Crear entorno virtual y dependencias Python
# ----------------------------
RUN python3 -m venv /opt/venv \
    && pip install --upgrade pip \
    && pip install debugpy

# ----------------------------
# Clonar Odoo 18 correctamente
# ----------------------------
RUN git clone -b 18.0 --single-branch https://github.com/odoo/odoo.git /opt/odoo/odoo-core && \
    chown -R odoo:odoo /opt/odoo/odoo-core

WORKDIR /opt/odoo/odoo-core

# ----------------------------
# Instalar dependencias de Odoo
# ----------------------------
RUN pip install -r /opt/odoo/odoo-core/requirements.txt

# ----------------------------
# Copiar requirements.txt adicional e instalar dependencias Python
# ----------------------------
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt

# ----------------------------
# Copiar entrypoint
# ----------------------------
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ----------------------------
# Cambiar a usuario no-root
# ----------------------------
USER 1001

ENTRYPOINT ["/entrypoint.sh"]

# ----------------------------
# Comando por defecto corregido
# ----------------------------
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5679", "--wait-for-client", "odoo-bin", "-c", "/etc/odoo/odoo.conf"]