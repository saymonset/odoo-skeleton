# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class PaymentLinesController(http.Controller):
    @http.route('/my_saymon/compute_price_subtotal_ref', type='json', auth='user')
    def compute_price_subtotal_ref(self, price_subtotal, currency_id, company_id):
        """
        Llama al método _compute_price_subtotal_ref en el backend y devuelve el resultado.
        """
        usd_currency = request.env['res.currency'].search([('name', '=', 'USD')], limit=1)
        currency = request.env['res.currency'].browse(currency_id)
        company = request.env['res.company'].browse(company_id)
        try:
            result = currency._convert(
                price_subtotal,
                usd_currency,
                company,
                fields.Date.today()
            )
        except Exception:
            result = 0.0
        return {'price_subtotal_ref': result}
