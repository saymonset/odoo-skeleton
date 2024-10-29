from odoo import api, fields, models


class Hostel(models.Model):
    _name = 'hostel.hostel'
    _description = "Information about hostel"
    _order = "id desc, name"
    #Este tributo es el  campo que se va  autilizar como nombre elegible para los registriosde este modelo
    _rec_name = 'hostel_code'

    name = fields.Char(string="hostel Name", required=True)
    hostel_code = fields.Char(string="Code", required=True)
    street = fields.Char('Street')
    street2 = fields.Char('Street2')
    zip = fields.Char('Zip', change_default=True)
    city = fields.Char('City')
    # country_id = fields.Many2one('res.country', string='Country')
    #country_id = fields.Many2one('res.country', string='Country Saymioon', default=lambda self: self.env.ref('base.mx').id)
   # country_id = fields.Many2one('res.country', string='Country', default=lambda self: self.env.ref('base.mx').id)
    country_id = fields.Many2one('res.country', string='Country', default=lambda self: self.env.ref('base.mx').id or self.env.ref('base.ve').id)
    state_id = fields.Many2one('res.country.state', string='State', domain="[('country_id', '=', country_id)]")
    phone = fields.Char('Phone',required=True)
    mobile = fields.Char('Mobile',required=True)
    email = fields.Char('Email')

    @api.depends('hostel_code')
    def _compute_display_name(self):
        for record in self:
            name = record.name
            if record.hostel_code:
                name = f'{name} ({record.hostel_code})'
            record.display_name = name
    
    # @api.onchange('country_id')
    # def _onchange_country_id(self):
    #     if self.country_id:
    #         # Update the domain for state_id based on the selected country_id
    #         states = self.env['res.country.state'].search([('country_id', '=', self.country_id.id)])
    #         state_ids = states.ids if states else []
    #         return {
    #             'domain': {
    #                 'state_id': [('id', 'in', state_ids)]
    #             }
    #         }
        
    @api.onchange('country_id')
    def _onchange_country_id(self):
        print('Hola mundo')
        for record in self:
            if record.country_id:
                states = self.env['res.country.state'].search([('country_id', '=', record.country_id.id)])
                state_ids = states.ids if states else []
                print('----------1-----xx-z---')
                mycod = str(record.country_id.id)
                print(f"record.country_id.id={mycod}")
                print(state_ids)  # This line will print the state_ids to the console
                print('----------2---------')
                return {
                    'domain': {
                        'state_id': [('id', 'in', state_ids)]
                    }
                }
