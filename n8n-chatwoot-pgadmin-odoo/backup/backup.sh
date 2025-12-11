#!/bin/sh
set -e

BACKUP_DIR="/backup/daily"
DATE=$(date +%Y-%m-%d)
DB_HOST="db"
DB_USER="odoo"
DB_PASS=$(cat /run/secrets/postgres_password)
DB_NAME_LIST=$(psql -h $DB_HOST -U $DB_USER -lqt | cut -d \| -f 1 | grep -vE 'template|postgres|^$')

mkdir -p $BACKUP_DIR

echo "🔁 Iniciando backup diario - $DATE"

# Dump de todas las bases Odoo/n8n
for dbname in $DB_NAME_LIST; do
  echo "→ Respaldando $dbname"
  PGPASSWORD="$DB_PASS" pg_dump -h $DB_HOST -U $DB_USER -F c "$dbname" > "$BACKUP_DIR/${dbname}_${DATE}.dump"
done

# Backup de n8n
echo "→ Respaldando datos de n8n..."
tar -czf "$BACKUP_DIR/n8n_${DATE}.tar.gz" /n8n_data

# Rotación de backups (mantiene 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup completo - $(date)"
sleep infinity
