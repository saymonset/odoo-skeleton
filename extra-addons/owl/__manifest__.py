# -*- coding: utf-8 -*-
{
    'name': 'OWL Tutorial',
    'version': '1.0',
    'summary': 'OWL Tutorial',
    'sequence': -1,
    'description': """OWL Tutorial""",
    'category': 'OWL',
    'depends': ['base', 'web','owl'],
    'data': [
        'security/ir.model.access.csv',
        'views/todo_list.xml',
        'views/res_partner.xml',
        'views/odoo_services.xml',
    ],
    'demo': [],
    'installable': True,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'owl/static/src/components/*/*.js',
            'owl/static/src/components/*/*.xml',
            'owl/static/src/components/*/*.scss',
        ],
    },
    'maintainer': 'Tu Nombre',  # Opcional: puedes agregar un mantenedor
    'website': 'https://tu-sitio-web.com',  # Opcional: puedes agregar un sitio web
    'support': 'soporte@tu-email.com',  # Opcional: puedes agregar un correo de soporte
    'odoo_version': '18.1',  # Este campo es opcional y no estándar, pero puedes usarlo para tu referencia
}
