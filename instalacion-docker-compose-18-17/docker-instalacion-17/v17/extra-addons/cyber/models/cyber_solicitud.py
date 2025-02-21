from odoo import models, fields

class Solicitud(models.Model):
    _name = 'cyber.solicitud'
    _description = 'Solicitud de copias'

    cliente_id = fields.Many2one('cyber.cliente', string='Cliente', required=True)
    estado = fields.Selection([
        ('pendiente', 'Pendiente'),
        ('en_curso', 'En Curso'),
        ('delivered', 'Entregado')],
        default='pendiente')