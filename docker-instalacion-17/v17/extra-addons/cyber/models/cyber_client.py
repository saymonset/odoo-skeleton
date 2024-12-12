from odoo import models, fields

class Cliente(models.Model):
    _name = 'cyber.cliente'
    _description = 'Cliente del ciber'
    _rec_name = 'nombre'

    nombre = fields.Char(string='Nombre', required=True)
    telefono = fields.Char(string='Teléfono', required=True)