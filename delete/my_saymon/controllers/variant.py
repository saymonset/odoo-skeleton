from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.variant import WebsiteSaleVariantController
import logging

_logger = logging.getLogger(__name__)

class WebsiteSaleVariantController(WebsiteSaleVariantController):
    
    def get_combination_info_website(self, product_template_id, product_id, combination, add_qty, parent_combination=None, **kwargs):
        # Llamar al método original
        res = super().get_combination_info_website(product_template_id, product_id, combination, add_qty, parent_combination, **kwargs)
        
        # Validar si el producto está restringido para el usuario actual
        if 'product_id' in res:
            _logger.debug("Checking restrictions for Product ID: %s", res['product_id'])
             # Convertir el campo relacional en una lista de IDs
            not_allowed_ids = request.env.user.not_allowed_products_ids.ids 
            #not_allowed_ids = request.env.user.parent_id.not_allowed_products_ids.ids
            if res['product_id'] in not_allowed_ids:
                res['is_combination_possible'] = False
        
        return res
