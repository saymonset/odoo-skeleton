# -*- coding: utf-8 -*-
{
    'name': "Cyber",  # Module title
    'summary': "Manage Cyber easily",  # Module subtitle phrase
    'description': """
Manage Cyber
==============
Description related to Cyber.
    """,  # Supports reStructuredText(RST) format
    "author": "Serpent Consulting Services Pvt. Ltd.",
    "category": "Tools",
    "website": "http://www.serpentcs.com",
    "depends": ['base','fleet'],  # Inherit from the existing Flota module
    "license": "AGPL-3",
    'data': [
        # 'security/groups.xml',
        # 'security/ir.model.access.csv',
        'views/fleet_extension_views.xml',
    ],
    # This demo data files will be loaded if db initialize with demo data (commented becaues file is not added in this example)
    # 'demo': [
    #     'demo.xml'
    # ],
}