# Como se lee esta aplicacion cuando arranca

1-) ESpera una peticin web http://localhost:8096//todo_owl y la recibe el contrlador
2-) En el controlador manda a llamar una view template llamada por su id:  todo_owl.playground
2-)En la plantilla vemos la instruccion  <t t-call-assets="todo_owl.assets_playground"/> que va a llamar los diferentes assets confiurados en _manifest_.py
  "Using <t t-call-assets="todo_owl.assets_playground"/> in Odoo OWL
The <t t-call-assets="todo_owl.assets_playground"/> is a Odoo-specific directive used in Odoo OWL (Odoo Web Library) components to load the necessary assets for the "todo_owl.assets_playground" bundle."
3-) De todos los assets, hay un assets llamado: todo_owl/static/src/main.js, hay es donde carga la aplicacion