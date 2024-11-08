from odoo import models, fields, api
from odoo import _
from odoo.exceptions import UserError
#from odoo.tools.translate import _


class Disease(models.Model):
    """
    Model representing a disease entity within the hospital system.

    This model supports hierarchical disease classifications and
    allows for categorization under different disease types. It can
    also maintain parent-child relationships between diseases.

    Fields:
        - name (Char): Name of the disease.
        - complete_name (Char): Full hierarchical name of the disease,
        including parent names.
        - description (Text): Description or details about the disease.
        - parent_id (Many2one): Reference to the parent disease.
        - child_ids (One2many): List of child diseases associated with
        the current disease.
        - disease_type_id (Many2one): Reference to the type of disease.
    """
    _name = 'a_hospital.disease'
    _description = 'Hospital Disease'
    _parent_store = True                # Вкл. підтримку ієрархії
    _parent_name = "parent_id"
    _rec_name = 'complete_name'
    _order = 'complete_name'

    name = fields.Char(string="Disease Name", required=True)
    state = fields.Selection([
        ('draft', 'Unavailable'),
        ('available', 'Available'),
        ('closed', 'Closed')],
        'State', default="draft")
    
    

    complete_name = fields.Char(
        compute='_compute_complete_name',
        recursive=True,
        store=True)

    description = fields.Text()
    
    disease_type_id = fields.Many2one(
        comodel_name='a_hospital.disease.type',
        string='Disease Type',
        required=False
    )

    parent_id = fields.Many2one(
        comodel_name='a_hospital.disease',
        string='Parent Disease',
        ondelete='cascade',
    )

    child_ids = fields.One2many(
        comodel_name='a_hospital.disease',
        inverse_name='parent_id',
        string='Child Diseases',
    )

    parent_path = fields.Char(
        index=True,
        unaccent=False)

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
                #continue
                message = _('Moving from %s to %s is not allowed') % (room.state, new_state)
                raise UserError(message)

 
#
    def log_all_room_members(self):
        hostel_room_obj = self.env['a_hospital.doctor']  # This is an empty recordset of model hostel.room.member
        all_members = hostel_room_obj.search([])
        print("ALL MEMBERS:", all_members)
        categ1 = {
            'name': 'Child category 1',
            'description': 'Description for child 1'
        }
        record = self.env['a_hospital.specialty'].create(categ1)
        return True
    
    def make_available(self):
        self.change_state('available')

    def make_closed(self):
        self.change_state('closed')
        
    @api.constrains('parent_id')
    def _check_parent_id(self):
        """
        Prevents the creation of cyclic disease hierarchies.
        Raises:
            ValidationError: If a recursive hierarchy is detected.
        """
        if not self._check_recursion():
            raise models.ValidationError(_(
                'You cannot create recursive hierarchy.'))

    @api.depends('name', 'parent_id')
    def _compute_complete_name(self):
        """
        Generates a complete hierarchical name for the disease,
        combining parent and child names.
        """
        for disease in self:
            if disease.parent_id:
                disease.complete_name = '%s / %s' % (
                    disease.parent_id.complete_name,
                    disease.name)
            else:
                disease.complete_name = disease.name
