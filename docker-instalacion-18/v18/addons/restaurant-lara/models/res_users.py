import logging
from odoo import api, fields, models
import string, random

_logger = logging.getLogger(__name__)

class ResUsers(models.Model):
    _inherit = 'res.users'
    # access_token = fields.Text(string='API Access Token', default=False)
    #fecha_api = fields.Date(string='Fecha API')
    _logger.info("---------AQUI VAMOS SAYMON--------------1--")
    _logger.info("---------AQUI VAMOS SAYMON-------------2---")
    print("---------AQUI VAMOS SAYMON--------------0xxxxx--")
         