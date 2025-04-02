# -*- coding: utf-8 -*-
#################################################################################
# Author      : CFIS (<https://www.cfis.store/>)
# Copyright(c): 2017-Present CFIS.
# All Rights Reserved.
#
#
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
#
# You should have received a copy of the License along with this program.
# If not, see <https://www.cfis.store/>
#################################################################################

{
    "name": "Gantt view for Projects / Project Gantt View",
    "summary": " The Planning view gives you a clear overview of what is already planned and what remains to be planned using Start Date and End Date.",
    "version": "18.0",
    "description": """
        Project Gantt View
        ==================
        This addon allows the users to show projects stasks in  gantt view, in a
        simple and graphical way.
        - Gantt View
        - create new Task
        - customize an existing Tasks
        - TreeView for Gantt Items
        - Task Deadline Indicator
        - Task Priority Indicator
        - Task Progress Indicator
        - Multiple Scales
        - Navigate to Todat, Previous and Next Day
        - Grouping Task/Project
        - Filter
        - Progress bar on Task
        - Popup Task Informations
        - Overdue Indicator
        - Milestone Task in Different Shape
        - Predecessor Links
        - Todyas Marker
        - Sorting
        - Gantt View
        - Project Gantt
        - Project Gantt View
        - Gantt view Project
    """,    
    "author": "CFIS",
    "maintainer": "CFIS",
    "license" :  "Other proprietary",
    "website": "https://www.cfis.store",
    "images": ["images/web_project_gantt_base_view.png"],
    "category": "Project",
    "depends": [
        "base",
        "web",
        "project",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/product_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "/web_project_gantt_base_view/static/lib/dhtmlxGantt/sources/dhtmlxgantt.js",            
            "/web_project_gantt_base_view/static/lib/dhtmlxGantt/sources/dhtmlxgantt.css",
            "/web_project_gantt_base_view/static/lib/dhtmlxGantt/sources/api.js",

            "/web_project_gantt_base_view/static/src/css/*.*",
            "/web_project_gantt_base_view/static/src/js/*.*",
        ],
    },
    "installable": True,
    "application": True,
    "price"                :  35,
    "currency"             :  "EUR",
}
