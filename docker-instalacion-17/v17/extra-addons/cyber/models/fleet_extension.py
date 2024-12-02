from odoo import models, fields

class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'  # Inherit from the existing fleet vehicle model

    new_field_sami = fields.Char(string="New Field Sonnyra")  # Add a new field