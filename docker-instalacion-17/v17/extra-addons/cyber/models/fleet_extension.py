# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import UserError
from odoo.tools.translate import _

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