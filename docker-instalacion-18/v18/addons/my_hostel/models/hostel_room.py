from odoo import fields, models


class HostelRoom(models.Model):

    _name = "hostel.room"
    _description = "Hostel Room Information"
    _rec_name = "room_no"

    name = fields.Char(string="Room Name", required=True)
    room_no = fields.Char("Room No.", required=True)
    floor_no = fields.Integer("Floor No.", default=1, help="Floor Number")
    currency_id = fields.Many2one('res.currency', string='Currency')
    rent_amount = fields.Monetary('Rent Amount', help="Enter rent amount per month")
    currency_other_id = fields.Many2one('res.currency', string='Currency')
    rent_other_amount = fields.Monetary('Rent Amount', currency_field='currency_other_id', help="Enter rent amount per month")
    # optional attribute: currency_field='currency_id' incase currency field have another name then 'currency_id'