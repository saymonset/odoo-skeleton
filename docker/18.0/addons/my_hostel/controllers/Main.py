from odoo import http
from odoo.http import request
from odoo.addons.website.controllers.main import Website

class WebsiteInfo(Website):
    @http.route()
    def website_info(self):
        result = super(WebsiteInfo, self).website_info()
        result.qcontext['apps'] = result.qcontext['apps'].filtered(
            lambda x: x.name != 'website'
        )
        return result
class Main(http.Controller):
    
    @http.route('/my_hostel/student_details', type='http', auth='none')
    def student_details(self, student_id):
        record = request.env['hostel.student'].sudo().browse(int(student_id))
        return u'<html><body><h1>%s</h1>Room No: %s' % (
            record.name,
            str(record.room_id.room_no) or 'none',
        )

    # @http.route("/my_hostel/student_details/<model('hostel.student'):student>",  
    #         type='http', auth='none')
    # def student_details_in_path(self, book):
    #     return self.student_details(student.id)

    @http.route('/my_hostel/all-students', type='http', auth='none')
    def all_students(self):
        students = request.env['hostel.student'].sudo().search([])
        html_result = '<html><body><ul>'
        for student in students:
            html_result += "<li> %s </li>" % student.name
        html_result += '</ul></body></html>'
        return html_result

    @http.route('/my_hostel/all-students/mark-mine', type='http', auth='public')
    def all_students_mark_mine(self):
        students = request.env['hostel.student'].sudo().search([])
        hostels = request.env['hostel.hostel'].sudo().search([('rector', '=', request.env.user.partner_id.id)])
        hostel_rooms = request.env['hostel.room'].sudo().search([('hostel_id', 'in', hostels.ids)])
        html_result = '<html><body><ul>'
        for student in students:
            if student.id in hostel_rooms.student_ids.ids:
                html_result += "<li> <b>%s</b> </li>" % student.name
            else:
                html_result += "<li> %s </li>" % student.name
        html_result += '</ul></body></html>'
        return html_result

    @http.route('/my_hostel/all-students/mine', type='http', auth='user')
    def all_students_mine(self):
        hostels = request.env['hostel.hostel'].sudo().search([('rector', '=', request.env.user.partner_id.id)])
        students = request.env['hostel.room'].sudo().search([('hostel_id', 'in', hostels.ids)]).student_ids
        html_result = '<html><body><ul>'
        for student in students:
            html_result += "<li> %s </li>" % student.name
        html_result += '</ul></body></html>'
        return html_result