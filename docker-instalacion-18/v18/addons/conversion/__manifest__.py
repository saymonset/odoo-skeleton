# -*- coding: utf-8 -*-
{
    'name': "conversion",
    'version': '18.0.1.0.0',
    'category': 'Point of Sale',
    'summary': "POS Custom, Odoo18, "
               "Odoo Apps",
    'description': """
Long description of module's purpose
    """,

    'author': "Saymonset",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list

    # any module necessary for this one to work correctly
    'depends': ['point_of_sale'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "conversion/static/src/**/*",
        ],
    },
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False
}

