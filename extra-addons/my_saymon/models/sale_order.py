# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'
    
    @api.onchange('pricelist_id')
    def onchange_pricelist_id(self):
        for order in self:
            if order.pricelist_id:
                # Llama al método _recompute_prices para actualizar los precios
                order._recompute_prices()

    def _recompute_prices(self):
        lines_to_recompute = self.order_line
        lines_to_recompute.invalidate_recordset(['pricelist_item_id'])
        lines_to_recompute.with_context(force_price_recomputation=True)._compute_price_unit()
        # Restablece el descuento a 0.0
        lines_to_recompute.discount = 0.0
        lines_to_recompute._compute_discount()
        self.show_update_pricelist = False

    def _get_exchange_rate(self, currency):
        # Implementa la lógica para obtener el tipo de cambio
        return 1.0  # Cambia esto por la lógica real
