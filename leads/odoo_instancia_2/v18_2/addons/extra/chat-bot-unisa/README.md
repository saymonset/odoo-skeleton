## Arquitectura y Componentes
 
chat-bot-unisa (Módulo de IA): Interfaz web para visualizar y gestionar mensajes, incorpora IA para transcripción y análisis de textos.
 
 Se puede heredar como lo hace Explorer Backend Theme para colocar un chat box en la web principal del portal

 0-) Sin instalas modulo 'rag_unisa' debes: Configuracion del chat bot principal de entrada 
 ```
     static/src/components/ChatBotWrapper/ChatBotWrapper.js
 ```

1-) para test: Cambiar en controller/capturar_lead_odoo_controller.py
```
@http.route('/chat-bot-unisa/test-capturar_lead',
```

 2-) Copiar modulo a test
```
cp -r /home/odoo/odoo-from-13-to-18/arquitectura/odoo18/clientes/cliente1/extra-addons/extra/chat-bot-unisa /home/odoo/odoo-skeleton/n8n-evolution-api-odoo-18/v18/addons/extra
```

###################   PRODUCCION      ##############
0-) Copiar modulo a prodccion

1-) para produccion: Cambiar en controller/capturar_lead_odoo_controller.py
```
@http.route('/chat-bot-unisa/capturar_lead',
```

```
cp -r /home/odoo/odoo-from-13-to-18/arquitectura/odoo18/clientes/cliente1/extra-addons/extra/chat-bot-unisa //home/odoo/odoo-skeleton/leads/odoo_instancia_2/v18_2/addons/extra
```