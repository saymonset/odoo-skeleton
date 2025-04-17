from odoo import http


class TestController(http.Controller):
    @http.route('/my_saymon/objects', type='http', auth='public', website=True)
    def owl_custom(self, **kw):
       return http.request.render('my_saymon.custom_page')


    @http.route('/my_saymon/objects/<model("TestController"):obj>', auth='public')
    def object(self, obj, **kw):
        return http.request.render('my_saymon.object', {'object': obj})