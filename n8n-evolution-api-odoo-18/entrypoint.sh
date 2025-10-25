#!/bin/bash
set -e
. /opt/venv/bin/activate

# Redirigir logs a stdout y archivo a la vez
exec "$@" 2>&1 | tee -a /var/log/odoo/odoo.log
