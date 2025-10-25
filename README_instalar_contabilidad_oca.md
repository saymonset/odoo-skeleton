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
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_payment_promissory_note  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_payment_return  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_payment_method_base  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/server-ux-18.0/base_tier_validation root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_payment_tier_validation  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_check_printing_report_base  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_due_list  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/bank-payment-18.0/account_payment_mode  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/bank-payment-18.0/account_payment_partner  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_due_list_payment_mode  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
```bash
scp -r /Users/simon/opt/odoo/oca/account-payment-18.0/account_payment_term_extension  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```

Modulos conciliacion:
```bash
scp -r /Users/simon/opt/odoo/oca/account-reconcile-18.0/account_move_base_import  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
scp -r /Users/simon/opt/odoo/oca/account-reconcile-18.0/account_reconcile_model_oca  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
scp -r /Users/simon/opt/odoo/oca/account-reconcile-18.0/account_reconcile_oca  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
scp -r /Users/simon/opt/odoo/oca/account-reconcile-18.0/account_statement_base  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
scp -r /Users/simon/opt/odoo/oca/account-reconcile-18.0/base_transaction_id  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```
# Instalar Audit Log (Community)
```bash
scp -r /Users/simon/opt/odoo/oca/server-tools-18.0/auditlog  root@5.189.161.7:/root/odoo/n8n-evolution-api-odoo-18/v18/addons
```

# Reiniciamos docker
```bash
docker restart odoo-18
```
# Colocamos el odoo como desarrollador para actualizar e instalar los nuevos modulos que estan en add_ons