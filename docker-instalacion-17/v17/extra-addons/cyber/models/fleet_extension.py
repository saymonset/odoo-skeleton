# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import UserError
from odoo.tools.translate import _
import logging
_logger = logging.getLogger(__name__)

class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'  # Inherit from the existing fleet vehicle model

    new_field_sami = fields.Char(string="New Field Sonnyra")  # Add a new field
    
    state = fields.Selection([
    ('draft', 'Unavailable'),
    ('available', 'Available'),
    ('closed', 'Closed')],
    'State', default="draft")

    @api.model
    def is_allowed_transition(self, old_state, new_state):
        allowed = [('draft', 'available'),
                   ('available', 'closed'),
                   ('closed', 'draft')]
        return (old_state, new_state) in allowed

    def change_state(self, new_state):
        for room in self:
            if room.is_allowed_transition(room.state, new_state):
                room.state = new_state
            else:
                 message = _('Moving from %s to %s is not allowed') % (room.state, new_state)
                 raise UserError(message)

    def make_available(self):
        self.change_state('available')

    def make_closed(self):
        self.change_state('closed')
        
    def log_all_room_members(self):
        hostel_room_obj = self.env['res.partner']  # This is an empty recordset of model hostel.room.member
        all_members = hostel_room_obj.search([])
        _logger.info("ALL MEMBERS: %s", all_members.ids)  # Cambiado para registrar solo los IDs
        return True   
    
    def create_categories(self):
        categ1 = {
            'name': 'Child category 1',
            'description': 'Description for child 1'
        }
        categ2 = {
            'name': 'Child category 2',
            'description': 'Description for child 2'
        }
        parent_category_val = {
            'name': 'Parent category',
            'description': 'Description for parent category',
            'child_ids': [
                (0, 0, categ1),
                (0, 0, categ2),
            ]
        }
        # Total 3 records (1 parent and 2 child) will be created in hostel.room.category model
        record = self.env['cyber.category'].create(parent_category_val)
        return True