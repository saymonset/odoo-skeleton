# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'
    
    price_total_ref = fields.Float(string='Total', digits='Product Price', default=0.0)
    
    
    def action_update_prices(self):
        self.ensure_one()
        self._recompute_prices()
    
    @api.onchange('pricelist_id')
    def onchange_pricelist_id(self):
        for order in self:
            if order.pricelist_id:
                # Inicializa el total de referencia
                isDolar = True;
                total_ref = 0.0
                exchange_rate_to_usd = 0.0
                exchange_rate_from_usd = 0.0
               
                # Actualiza los campos de referencia en las líneas de pedido
                for line in order.order_line:
                    # Obtiene la moneda de la lista de precios
                    currency_id = order.pricelist_id.currency_id
                    # Obtiene el tipo de cambio para convertir a USD
                    exchange_rate_to_usd = self._get_exchange_rate(currency_id)
                    exchange_rate_from_usd = self._get_exchange_rate('USD')
                    
                    # Calcula el precio unitario y subtotal en dólares
                    if currency_id.name != 'USD':
                        isDolar = False
                         # Calcula el precio en USD usando el tipo de cambio
                        line.price_unit_ref = line.price_unit * (exchange_rate_to_usd / exchange_rate_from_usd)
                        line.price_subtotal_ref = line.price_subtotal * (exchange_rate_to_usd / exchange_rate_from_usd)
                    
                    if not isDolar:  
                        # Suma el subtotal de cada línea para calcular el total de referencia
                        total_ref += line.price_subtotal_ref
                if not isDolar:  
                    # Asigna el total de referencia a price_total_ref
                    order.price_total_ref = total_ref       
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
    
