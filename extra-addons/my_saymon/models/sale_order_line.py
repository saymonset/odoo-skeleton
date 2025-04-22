# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class Sale_order_line(models.Model):
     _inherit = 'sale.order.line'

     price_unit_ref = fields.Float(string='Referencia Precio Unitario', digits='Product Price', default=0.0)
     price_subtotal_ref = fields.Float(string='Referencia Subtotal', digits='Product Price', default=0.0)
   
     @api.onchange('product_id', 'product_uom_qty', 'price_unit')
     def _onchange_order_line(self):
        # Llama al método de actualización de precios en el pedido
        if self.order_id:
            self.order_id.action_update_prices()

