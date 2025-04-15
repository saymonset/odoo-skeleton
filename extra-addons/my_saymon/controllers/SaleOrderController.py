from odoo import http
from odoo.http import request

class SaleOrderController(http.Controller):

    @http.route('/update_pricelist', type='json', auth='user')
    def update_pricelist(self, order_id, pricelist_id):
        """Actualizar la lista de precios de un pedido de venta."""
        sale_order = request.env['sale.order'].browse(order_id)
        if sale_order.exists():
            sale_order.write({'pricelist_id': pricelist_id})
            return {'success': True, 'message': 'Lista de precios actualizada correctamente.'}
        return {'success': False, 'message': 'Pedido de venta no encontrado.'}
