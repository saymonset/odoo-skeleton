# -*- coding: utf-8 -*-
{
    'name': 'My_saymon',
    'version': '1.0.0',
    'summary': """ My_saymon Summary """,
    'author': '',
    'website': '',
    'category': '',
    'depends': ['base', 'web','website_sale'],
    "data": [
        "security/ir.model.access.csv",
        "views/res_partner_view_views.xml",
    ],
    'assets': {
              'web.assets_backend': [
                  'my_saymon/static/src/**/*'
              ],
          },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
