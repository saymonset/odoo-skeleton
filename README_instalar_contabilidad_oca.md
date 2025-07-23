  # Instalar contabilidad
  ```bash
  scp -r /Users/simon/opt/odoo/oca/account-financial-reporting-18.0/server-ux-18.0/date_range root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
  ```
  ```bash
  scp -r /Users/simon/opt/odoo/oca/account-financial-reporting-18.0/reporting-engine-18.0/report_xlsx root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-financial-reporting-18.0/account_financial_report  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-financial-reporting-18.0/account_tax_balance  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
# Reiniciamos docker
```bash
docker restart odoo-18
```
# Colocamos el odoo como desarrollador para actualizar e instalar los nuevos modulos que estan en add_ons