{
    "name": "Hostel Management",  # Module title
    "summary": "Manage Hostel easily",  # Module subtitle phrase
    "description": """
Manage Hostel
==============
Efficiently manage the entire residential facility in the school
    """,  # Supports reStructuredText(RST) format (description is Deprecated)
    "version": "18.0",
    "author": "Serpent Consulting Services Pvt. Ltd.",
    "category": "Hostel",
    "website": "http://www.serpentcs.com",
    "license": "AGPL-3",
    "depends": ["base_setup"],
    'data': [
        'security/groups.xml',
        'security/ir.model.access.csv',
        'security/security_rules.xml',
        'views/hostel_room.xml',
        'views/hostel_room_category.xml'
    ],
    # This demo data files will be loaded if db initialize with demo data (commented because file is not added in this example)
    # 'demo': [
    #     'demo.xml'
    # ],
    "installable": True,
}
