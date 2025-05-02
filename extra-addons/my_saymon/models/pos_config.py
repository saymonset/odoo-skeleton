# -*- coding: utf-8 -*-
import logging

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = 'pos.config'
    @api.model
    def get_pos_ui_payment_methods(self, config_id):
        config = self.browse(config_id)
        payment_methods = config.payment_method_ids
        
        return payment_methods.read(['name', 'is_igtf', 'igtf_percentage', 'journal_id'])
