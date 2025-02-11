# -*- coding: utf-8 -*-

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    group_hostel_user = fields.Boolean(string="saymons pertenece Hostel User", implied_group='my_hostel.group_hostel_user')