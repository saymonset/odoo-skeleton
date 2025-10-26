#!/bin/bash
echo "=== CONFIGURANDO DEBUGGING FRONTEND ODOO 18 ==="

# 1. Verificar que Odoo esté corriendo
echo "Verificando Odoo..."
docker-compose ps | grep odoo-18

# 2. Activar modo desarrollo en odoo.conf
echo "Configurando modo desarrollo..."
if ! grep -q "dev_mode" v18/config/odoo.conf; then
    echo "dev_mode = True" >> v18/config/odoo.conf
    echo "Modo desarrollo activado"
else
    echo "Modo desarrollo ya estaba configurado"
fi

# 3. Reiniciar Odoo
echo "Reiniciando Odoo..."
docker-compose restart web

# 4. Esperar y verificar
sleep 5
echo "Odoo reiniciado. Verificando..."
docker logs odoo-18 --tail 5

echo ""
echo "=== INSTRUCCIONES FRONTEND DEBUGGING ==="
echo "1. Abre VSCode"
echo "2. Ve a Run and Debug (Ctrl+Shift+D)"
echo "3. Selecciona 'Debug Odoo Frontend (Owl 2)'"
echo "4. Click en Play"
echo "5. Se abrirá Chrome y podrás poner breakpoints en JS"
echo ""
echo "URL: http://localhost:18069"