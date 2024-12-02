# -*- coding: utf-8 -*-
from odoo import api, fields, models

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
                continue

    def make_available(self):
        self.change_state('available')

    def make_closed(self):
        self.change_state('closed')