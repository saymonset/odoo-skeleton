# -*- coding: utf-8 -*-
{
    'name': 'igtfpaymentmethod',
    'version': '1.0.0',
    'summary': """ Addons_igtfpaymentmethod Summary """,
    'author': 'saymon_set@hotmail.com',
    'website': 'https://www.jumpjibe.com',
    'category': 'igtf',
      'depends': ['base', 'point_of_sale','sale'],

    "data": [
        "security/ir.model.access.csv",
        "views/pos_payment_method_views.xml",
		"views/sale_order_view_views.xml"
    ],
    'assets': {
             
               'point_of_sale.assets': [
                    'igtfpaymentmethod/static/src/**/*',
                    
                ],
                "point_of_sale._assets_pos": [
                    "igtfpaymentmethod/static/src/**/*",
                ],
                'web.assets_qweb': [
                    'igtfpaymentmethod/static/src/**/*',
                ],
          },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
