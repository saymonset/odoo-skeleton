# -*- coding: utf-8 -*-
from odoo import api, fields, models


class CyberCategory(models.Model):
    _name = 'cyber.category'
    _inherit = ['mail.thread', 'mail.activity.mixin']
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
    
    cyber_room_ids = fields.One2many(
        'cyber.room', 'cyber_room_category_id',
        string='Cyber Room')
    related_hostel_room = fields.Integer(compute='_compute_related_hostel_room')

    def _compute_related_hostel_room(self):
        for record in self:
            record.related_hostel_room = self.env['cyber.room'].search_count([
                ('cyber_room_category_id', '=', record.id),
            ])

    def action_open_related_hostel_room(self):
        related_hostel_room_ids = self.env['cyber.room'].search([
                ('cyber_room_category_id', '=', self.id),
            ]).ids
        return {
            'type': 'ir.actions.act_window',
            'name': _('Cyber Room'),
            'res_model': 'cyber.room',
            'view_type': 'list',
            'view_mode': 'list',
            'views': [[False, 'list'], [False, 'form']],
            'domain': [('id', 'in', related_hostel_room_ids)],
        }

