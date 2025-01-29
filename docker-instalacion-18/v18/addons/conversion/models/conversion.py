# -*- coding: utf-8 -*-

from odoo import models, fields, api


class conversion(models.Model):
    _name = 'conversion.conversion'
    _description = 'conversion'
    _order = 'id desc'

    name = fields.Char(string="Name")  # Campo tipo string
    dateCurrency = fields.Date(string="Currency Date")  # Campo tipo fecha
   # mount = fields.Float(string="Amount", digits=(16, 2))  # Campo tipo float con dos decimales
    #currency_id = fields.Many2one('res.currency', string='Tipo de moneda')
    #rent_amount = fields.Monetary('Rent Amount', help="Enter rent amount per month", string='Tipo de moneda') 


