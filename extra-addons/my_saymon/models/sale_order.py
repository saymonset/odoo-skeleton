# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'
    
    price_total_ref = fields.Float(string='Total', digits='Product Price', default=0.0)
    
    
    def action_update_prices(self):
        self.ensure_one()
        self.onchange_pricelist_id()
    
    @api.onchange('pricelist_id')
    def onchange_pricelist_id(self):
        for order in self:
            # Llama al método _recompute_prices para actualizar los precios
            order._recompute_prices()
            
            if order.pricelist_id:
                # Inicializa el total de referencia
                isDolar = True;
                total_ref = 0.0
                exchange_rate_to_usd = 0.0
                exchange_rate_from_usd = 0.0
               
                # Actualiza los campos de referencia en las líneas de pedido
                for line in order.order_line:
                    # Obtiene las monedas de origen y destino
                    from_currency = order.pricelist_id.currency_id
                    to_currency = self.env['res.currency'].search([('name', '=', 'USD')], limit=1)
                    # Obtiene la moneda de la lista de precios
                    currency_id = order.pricelist_id.currency_id
                    # Obtiene el tipo de cambio para convertir a USD
                    #exchange_rate_to_usd = self._get_exchange_rate(currency_id)
                   # exchange_rate_from_usd = self._get_exchange_rate('USD')
                    
                    # Calcula el precio unitario y subtotal en dólares
                    if currency_id.name != 'USD':
                        isDolar = False
                        # Convierte el precio unitario a USD
                        price_unit_in_usd = self.convert_price_to_currency(line.price_unit, from_currency, to_currency)
                        line.price_unit_ref = price_unit_in_usd
                        
                        # price_unit_in_usd = line.price_unit * (exchange_rate_to_usd / exchange_rate_from_usd)
                        # line.price_unit_ref = price_unit_in_usd
                         # Convierte el subtotal a USD
                        price_subtotal_in_usd = self.convert_price_to_currency(line.price_subtotal, from_currency, to_currency)
                        line.price_subtotal_ref = price_subtotal_in_usd
                        # price_subtotal_in_usd = line.price_subtotal * (exchange_rate_to_usd / exchange_rate_from_usd)
                        # line.price_subtotal_ref = price_subtotal_in_usd
                       # line.price_subtotal_ref = line.price_subtotal * (exchange_rate_to_usd / exchange_rate_from_usd)
                    elif currency_id.name == 'USD':
                        line.price_unit_ref = line.price_unit  
                        line.price_subtotal_ref = line.price_subtotal 
                    if not isDolar:  
                        # Suma el subtotal de cada línea para calcular el total de referencia
                        total_ref += line.price_subtotal_ref
                if not isDolar:  
                    # Asigna el total de referencia a price_total_ref
                    order.price_total_ref = total_ref       
                

    def _recompute_prices(self):
        lines_to_recompute = self.order_line
        lines_to_recompute.invalidate_recordset(['pricelist_item_id'])
        lines_to_recompute.with_context(force_price_recomputation=True)._compute_price_unit()
        # Restablece el descuento a 0.0
        lines_to_recompute.discount = 0.0
        lines_to_recompute._compute_discount()
        self.show_update_pricelist = False

    @api.model
    def convert_price_to_currency(self, price_unit, from_currency, to_currency):
        """
        Convierte un precio unitario de una moneda a otra utilizando los tipos de cambio.

        :param price_unit: Precio unitario a convertir.
        :param from_currency: Moneda de origen (objeto currency_id).
        :param to_currency: Moneda de destino (objeto currency_id).
        :return: Precio convertido a la moneda de destino.
        """
        if from_currency == to_currency:
            # Si las monedas son iguales, no se realiza conversión
            return price_unit

        # Obtiene los tipos de cambio
        exchange_rate_to_currency = self._get_exchange_rate(to_currency)
        exchange_rate_from_currency = self._get_exchange_rate(from_currency)

        # Calcula el precio convertido
        converted_price = price_unit * (exchange_rate_to_currency / exchange_rate_from_currency)
        return converted_price
    
    def _get_exchange_rate(self, currency):
        # Asegúrate de que el objeto currency es válido
        if not currency:
            return 1.0  # Retorna 1.0 si no hay moneda

        # Busca la moneda en la base de datos
        currency_record = self.env['res.currency'].search([('id', '=', currency.id)], limit=1)
        
        if currency_record:
            # Retorna el tipo de cambio a USD
            return currency_record.rate  # Asegúrate de que 'rate' es el campo correcto que contiene el tipo de cambio
        else:
            return 1.0  # Valor por defecto si no se encuentra la moneda
 # Cambia esto por la lógica real
    
