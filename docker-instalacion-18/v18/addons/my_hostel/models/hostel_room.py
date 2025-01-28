import logging
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)

class HostelRoom(models.Model):

    _name = "hostel.room"
    _description = "Hostel Room Information"
    _rec_name = "room_no"
    
    @api.depends("student_per_room", "student_ids")
    def _compute_check_availability(self):
        """Method to check room availability"""
        for rec in self:
            rec.availability = rec.student_per_room - len(rec.student_ids.ids)
            
    name = fields.Char(string="Room Name", required=True)
    room_no = fields.Char("Room No.", required=True)
    floor_no = fields.Integer("Floor No.", default=1, help="Floor Number")
    currency_id = fields.Many2one('res.currency', string='Currency')
    rent_amount = fields.Monetary('Rent Amount', help="Enter rent amount per month") 
    currency_other_id = fields.Many2one('res.currency', string='Currency')
    rent_other_amount = fields.Monetary('Rent Amount', currency_field='currency_other_id', help="Enter rent amount per month")
 
    hostel_id = fields.Many2one("hostel.hostel", "hostel", help="Name of hostel")
    student_ids = fields.One2many("hostel.student", "room_id",
        string="Students", help="Enter students")
    hostel_amenities_ids = fields.Many2many("hostel.amenities",
        "hostel_room_amenities_rel", "room_id", "amenitiy_id",
        string="Amenities", domain="[('active', '=', True)]",
        help="Select hostel room amenities") 
    student_per_room = fields.Integer("Student Per Room", required=True,
        help="Students allocated per room")
    availability = fields.Float(compute="_compute_check_availability",
        store=True, string="Availability", help="Room availability in hostel")
    room_rating = fields.Float('Hostel Average Rating', digits=(14, 4))
    member_ids = fields.Many2many('hostel.room.member', string='Members')
    state = fields.Selection([
        ('draft', 'Unavailable'),
        ('available', 'Available'),
        ('closed', 'Closed')],
        'State', default="draft")
    remarks = fields.Text('Remarks')
    
    @api.model
    def is_allowed_transition(self, old_state, new_state):
        allowed = [('draft', 'available'),
                   ('available', 'closed'),
                   ('closed', 'draft')]
        return (old_state, new_state) in allowed

    def change_state(self, new_state):
        for room in self:
            if room.is_allowed_transition(room.state, new_state):
                room.state = new_state
            else:
                message = _('Moving from %s to %s is not allowed') % (room.state, new_state)
                raise UserError(message)

    def make_available(self):
        self.change_state('available')

    def make_closed(self):
        self.change_state('closed')
        
    def log_all_room_members(self):
        hostel_room_obj = self.env['hostel.room.member']  # This is an empty recordset of model hostel.room.member
        all_members = hostel_room_obj.search([])
        print("ALL MEMBERS:", all_members)
        return True
    
    
    
    _sql_constraints = [
       ("room_no_unique", "unique(room_no)", "Room number must be unique!")]

    @api.constrains("rent_amount")
    def _check_rent_amount(self):
        """Constraint on negative rent amount"""
        if self.rent_amount < 0:
            raise ValidationError(_("Rent Amount Per Month should not be a negative value!"))
    
    def create_categories(self):
        categ1 = {
            'name': 'Child category 1',
            'description': 'Description for child 1'
        }
        categ2 = {
            'name': 'Child category 2',
            'description': 'Description for child 2'
        }
        parent_category_val = {
            'name': 'Parent category',
            'description': 'Description for parent category',
            'child_ids': [
                (0, 0, categ1),
                (0, 0, categ2),
            ]
        }
        # Total 3 records (1 parent and 2 child) will be created in hostel.room.category model
        record = self.env['hostel.room.category'].create(parent_category_val)
        return True

    def update_room_no(self):
        self.ensure_one()
        self.room_no = "RM002"
        
    def find_room(self):
        domain = [
            '|',
                '&', ('name', 'ilike', 'Room Name'),
                     ('category_id.name', '=', 'Category Name'),
                '&', ('name', 'ilike', 'Second Room Name'),
                     ('category_id.name', '=', 'Second Category Name')
        ]
        Rooms = self.search(domain)
        _logger.info('Room found: %s', Rooms)
        return True
    
        # Traversing recordset
    def mapped_rooms(self):
        all_rooms = self.search([])
        room_authors = self.get_member_names(all_rooms)
        _logger.info('Room Members: %s', room_authors)

    @api.model
    def get_member_names(self, all_rooms):
        return all_rooms.mapped('member_ids.name')
    
     # Sorting recordset
    def sort_room(self):
        all_rooms = self.search([])
        rooms_sorted = self.sort_rooms_by_rating(all_rooms)
        _logger.info('Rooms before sorting: %s', all_rooms)
        _logger.info('Rooms after sorting: %s', rooms_sorted)

    @api.model
    def sort_rooms_by_rating(self, all_rooms):
        return all_rooms.sorted(key='room_rating')