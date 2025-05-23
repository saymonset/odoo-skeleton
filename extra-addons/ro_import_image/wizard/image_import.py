from odoo import fields, models, api


class ModelName(models.TransientModel):
    _name = 'image.import'
    _description = 'Image import '

    model_id = fields.Many2one('ir.model', string='Model')
    field_reference_id = fields.Many2one(comodel_name='ir.model.fields', string='Field Reference')
    field_imagen_id = fields.Many2one(comodel_name='ir.model.fields', string='Field Imagen')
    image_ids = fields.Many2many(comodel_name='ir.attachment', string='Images')

    def import_image(self):
        for record in self.image_ids:
            image_name = record.name.split('.')[0].strip()
            item = self.env[self.model_id.model].search([(self.field_reference_id.name, '=', image_name)])
            if item:
                item.update({self.field_imagen_id.name: record.datas})
