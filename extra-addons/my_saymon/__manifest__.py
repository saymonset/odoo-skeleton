# -*- coding: utf-8 -*-
{
    'name': 'My_saymon',
    'version': '1.0.0',
    'summary': """ My_saymon Summary """,
    'author': '',
    'website': '',
    'category': '',
    'depends': ['base','point_of_sale'],
    'version': '18.0',
    "data": [
        "security/ir.model.access.csv",
        "views/res_partner_view_views.xml",
        "views/sale_order_view_views.xml"
    ],
   "assets": {
        'point_of_sale.assets': [
            'my_saymon/static/src/**/*',
            
        ],
        "point_of_sale._assets_pos": [
            "my_saymon/static/src/**/*",
        ],
        'web.assets_qweb': [
            'my_saymon/static/src/**/*',
        ],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}