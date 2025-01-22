
{
    # Module information
    'name': 'My Hostel',
    'version': '18.0',
    'category': 'Extra Tools',
    'license': 'LGPL-3',
    'summary': """
        Odoo16 Book
    """,

    # Author
    'author': 'Serpent Consulting Services Pvt. Ltd.',
    'website': 'http://www.serpentcs.com',

    # Dependancies
    'depends': ['web', 'base', 'website'],

    # Views
    'data': [
        "security/hostel_security.xml",
        "security/ir.model.access.csv",
        'views/custom_template.xml',
        "views/hostel.xml",
        "views/hostel_room.xml",
        "views/hostel_student.xml",
    ],
        'assets': {
        'web.assets_frontend': [
                'my_hostel/static/src/scss/hostel.scss',
                'my_hostel/static/src/js/hostel.js',
        ],
        'web.assets_backend': [
                'my_hostel/static/src/scss/field_widget.scss',
                'my_hostel/static/src/js/field_widget.js',
                'my_hostel/static/src/xml/field_widget.xml',
                'my_hostel/static/src/js/component.js',
        ],
     },

    # Technical
    'installable': True,
    'auto_install': False,
}

