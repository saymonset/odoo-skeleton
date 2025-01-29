# -*- coding: utf-8 -*-

from odoo import models, fields, api


class conversion(models.Model):
    _name = 'conversion.conversion'
    _description = 'conversion'

    name = fields.Char()
    

