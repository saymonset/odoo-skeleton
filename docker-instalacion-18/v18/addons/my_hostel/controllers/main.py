# -*- coding: utf-8 -*-
from odoo import http, tools, _
from odoo.http import request


class InquiryForm(http.Controller):

    @http.route('/hostel/<model("hostel.hostel"):hostel>', type='http', auth="user", website=True)
    def hostel_room_detail(self, hostel):
        return request.render(
        'my_hostel.hostel_detail', {
        'hostel': hostel,
        })
    @http.route('/inquiry/form', type='http', auth="public", website=True)
    def inquiry_form_template(self, **kw):
        return request.render("my_hostel.hostel_inquiry_form")
    

    @http.route('/inquiry/submit', type='http', auth="public", website=True)
    def inquiry_form(self, **kwargs):
        inquiry_obj = request.env['hostel.inquiries']
        form_vals = {
            'name': kwargs.get('name') or '',
            'email': kwargs.get('email') or '',
            'phone': kwargs.get('phone') or '',
            'book_fy': kwargs.get('book_fy') or '',
            'queries': kwargs.get('queries') or '',
            }
        submit_success = inquiry_obj.sudo().create(form_vals)
        return request.redirect('/contactus-thank-you')
