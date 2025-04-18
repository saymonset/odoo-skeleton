from odoo import fields, models


class Hostel(models.Model):
    _name = 'hostel.hostel'
    _description = "Information about hostel"

    name = fields.Char(string="hostel Name", required=True)
    hostel_code = fields.Char(string="Code", required=True)
    street = fields.Char('Street')
    street2 = fields.Char('Street2')
    is_public = fields.Boolean(groups='my_hostel.group_hostel_manager')
    notes = fields.Text(groups="my_hostel.group_hostel_manager")
    date_start = fields.Date('Start Date', groups='my_hostel.group_start_dateII')
    details_added = fields.Text(string="Details")
    
    def add_details(self):
        self.ensure_one()
        message = "Details are(added by: %s)" % self.env.user.name
        self.sudo().write({ 'details_added': message })
