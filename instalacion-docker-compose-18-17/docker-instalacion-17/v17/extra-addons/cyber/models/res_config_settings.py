# -*- coding: utf-8 -*-
from odoo import models, fields


class ConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    group_cyber_description = fields.Boolean(
        "Manage cyber and see description in cyber",
        group='base.group_user',
        implied_group='cyber.group_cyber_description',
    )
