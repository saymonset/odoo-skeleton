# -*- coding: utf-8 -*-
from odoo import api, fields, models


class CyberCategory(models.Model):
    _name = 'cyber.category'
    _description = "Cyber Category"

    name = fields.Char('Category')
    description = fields.Text('Description')
    parent_id = fields.Many2one(
        'cyber.category',
        string='Parent Category',
        ondelete='restrict',
        index=True
    )
    child_ids = fields.One2many(
        'cyber.category', 'parent_id',
        string='Child Categories')