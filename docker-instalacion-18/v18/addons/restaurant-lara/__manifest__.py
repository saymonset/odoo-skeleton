{
    "name": "restaurant-lara",  # Module title
    "summary": "Manage Restaurant easily",  # Module subtitle phrase
    "description": """
Manage Restaurant
==============
    """,  # Supports reStructuredText(RST) format (description is Deprecated)
    "version": "18.0",
    "author": "saymon_set@hotmail.com",
    "category": "restaurant-lara",
    "website": "http://www.serpentcs.com",
    "license": "AGPL-3",
    "depends": ['base','hr','web', 'point_of_sale'],
    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'views/login_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'restaurant-lara/static/src/scss/point_of_sale_customization.scss',
            'restaurant-lara/static/src/xml/point_of_sale_customization.xml',
            'restaurant-lara/static/src/js/point_of_sale_customization.js'
        ],
        
    },
    # This demo data files will be loaded if db initialize with demo data (commented because file is not added in this example)
    # 'demo': [
    #     'demo.xml'
    # ],
    "installable": True,
}
