# -*- coding: utf-8 -*-

import base64
import json
import logging
import ast
import math
from datetime import datetime

import pytz
import requests
from lxml import etree
from odoo.exceptions import UserError
from odoo.tools.float_utils import float_round
from reportlab.graphics.barcode import createBarcodeDrawing
from reportlab.lib.units import mm
import re
from odoo import api, fields, models, _
from . import amount_to_text_es_MX

_logger = logging.getLogger(__name__)


class AccountRegisterPayment(models.TransientModel):
    _inherit = 'account.payment.register'

    def validate_complete_payment(self):
        for rec in self:
            payments = rec._create_payments()
            if len(payments) > 1:
                return
            else:
                return {
                    'name': _('Payments'),
                    'view_type': 'form',
                    'view_mode': 'form',
                    'res_model': 'account.payment',
                    'view_id': False,
                    'type': 'ir.actions.act_window',
                    'res_id': payments.id,
                }

    def _create_payment_vals_from_wizard(self, batch_result):
        res = super(AccountRegisterPayment, self)._create_payment_vals_from_wizard(batch_result)

        timezone = self._context.get('tz')
        if not timezone:
            timezone = self.env.user.partner_id.tz or 'America/Mexico_City'
        local = pytz.timezone(timezone)
        naive_from = self.payment_date
        res.update({'fecha_pago': datetime(self.payment_date.year, self.payment_date.month, self.payment_date.day, 16,
                                           0, tzinfo=local).strftime("%Y-%m-%d %H:%M:%S")})
        return res

    company_cfdi = fields.Boolean(related="company_id.company_cfdi", store=True)


class AccountPayment(models.Model):
    _inherit = 'account.payment'

    forma_pago_id = fields.Many2one('catalogo.forma.pago', string='Forma de pago')
    forma_de_pago = fields.Char(related="forma_pago_id.code", string="Forma pago")

    methodo_pago = fields.Selection(
        selection=[('PUE', _('Pago en una sola exhibición')),
                   ('PPD', _('Pago en parcialidades o diferido')), ],
        string=_('Método de pago'),
    )
    # no_de_pago = fields.Integer("No. de pago", readonly=True)
    # saldo_pendiente = fields.Float("Saldo pendiente", readonly=True)
    # monto_pagar = fields.Float("Monto a pagar", compute='_compute_monto_pagar')
    # saldo_restante = fields.Float("Saldo restante", readonly=True)
    fecha_pago = fields.Datetime("Fecha de pago")
    date_payment = fields.Datetime("Fecha de CFDI", copy=False)
    cuenta_emisor = fields.Many2one('res.partner.bank', string=_('Cuenta del emisor'))
    banco_emisor = fields.Char("Banco del emisor", related='cuenta_emisor.bank_name', readonly=True)
    rfc_banco_emisor = fields.Char(_("RFC banco emisor"), related='cuenta_emisor.bank_bic', readonly=True)
    numero_operacion = fields.Char(_("Número de operación"))
    banco_receptor = fields.Char(_("Banco receptor"), compute='_compute_banco_receptor')
    cuenta_beneficiario = fields.Char(_("Cuenta beneficiario"), compute='_compute_banco_receptor')
    rfc_banco_receptor = fields.Char(_("RFC banco receptor"), compute='_compute_banco_receptor')
    estado_pago = fields.Selection(
        selection=[('pago_no_enviado', 'REP no generado'), ('pago_correcto', 'REP correcto'),
                   ('problemas_factura', 'Problemas con el pago'), ('solicitud_cancelar', 'Cancelación en proceso'),
                   ('cancelar_rechazo', 'Cancelación rechazada'), ('factura_cancelada', 'REP cancelado'), ],
        string=_('Estado CFDI'),
        default='pago_no_enviado',
        readonly=True, copy=False
    )
    tipo_relacion = fields.Selection(
        selection=[('04', 'Sustitución de los CFDI previos'), ],
        string=_('Tipo relación'),
    )
    uuid_relacionado = fields.Char(string=_('CFDI Relacionado'))
    confirmacion = fields.Char(string=_('Confirmación'))
    folio_fiscal = fields.Char(string=_('Folio Fiscal'), readonly=True, copy=False)
    numero_cetificado = fields.Char(string=_('Numero de certificado'))
    cetificaso_sat = fields.Char(string=_('Cetificado SAT'))
    fecha_certificacion = fields.Char(string=_('Fecha y Hora Certificación'))
    cadena_origenal = fields.Char(string=_('Cadena Original del Complemento digital de SAT'))
    selo_digital_cdfi = fields.Char(string=_('Sello Digital del CDFI'))
    selo_sat = fields.Char(string=_('Sello del SAT'))
    #   moneda = fields.Char(string=_('Moneda'))
    monedap = fields.Char(string=_('Moneda'))
    #    tipocambio = fields.Char(string=_('TipoCambio'))
    tipocambiop = fields.Char(string=_('TipoCambio'))
    #folio = fields.Char(string=_('Folio'))
    #  version = fields.Char(string=_('Version'))
    number_folio = fields.Char(string=_('Folio'), compute='_get_number_folio')
    amount_to_text = fields.Char('Amount to Text', compute='_get_amount_to_text',
                                 size=256,
                                 help='Amount of the invoice in letter')
    qr_value = fields.Char(string=_('QR Code Value'))
    qrcode_image = fields.Binary("QRCode")
    #    rfc_emisor = fields.Char(string=_('RFC'))
    #    name_emisor = fields.Char(string=_('Name'))
    xml_payment_link = fields.Char(string=_('XML link'), readonly=True)
    payment_mail_ids = fields.One2many('account.payment.mail', 'payment_id', string='Payment Mails')
    iddocumento = fields.Char(string=_('iddocumento'))
    fecha_emision = fields.Char(string=_('Fecha y Hora Certificación'))
    docto_relacionados = fields.Text("Docto relacionados", default='[]')
    cep_sello = fields.Char(string=_('cep_sello'))
    cep_numeroCertificado = fields.Char(string=_('cep_numeroCertificado'))
    cep_cadenaCDA = fields.Char(string=_('cep_cadenaCDA'))
    cep_claveSPEI = fields.Char(string=_('cep_claveSPEI'))
    retencionesp = fields.Text("traslados P", default='[]')
    trasladosp = fields.Text("retenciones P", default='[]')
    total_pago = fields.Float("Total pagado")
    partials_payment_ids = fields.One2many('facturas.pago', 'doc_id', 'Montos')
    manual_partials = fields.Boolean("Montos manuales")
    different_currency = fields.Boolean(_("Diferente moneda"), compute='_compute_different_currency')
    company_cfdi = fields.Boolean(related="company_id.company_cfdi", store=True)
    redondeo_t_base = fields.Selection(
        selection=[('01', _('Tradicional')),
                   ('02', _('Decimal')),
                   ('03', _('Techo')),
                   ('04', _('Truncar')),],
        default='01',
        string=_('Redondeo base'), 
    )
    redondeo_t_impuesto = fields.Selection(
        selection=[('01', _('Tradicional')),
                   ('02', _('Decimal')),
                   ('03', _('Techo')),
                   ('04', _('Truncar')),],
        default='01',
        string=_('Redondeo impuesto'), 
    )
    redondeo_t_total = fields.Selection(
        selection=[('01', _('Tradicional')),
                   ('02', _('Decimal')),
                   ('03', _('Techo')),
                   ('04', _('Truncar')),],
        default='01',
        string=_('Redondeo total'), 
    )

    @api.depends('name')
    def _get_number_folio(self):
        for record in self:
            if record.name:
                record.number_folio = record.name.replace('CUST.IN', '').replace('/', '')

    @api.model
    def get_docto_relacionados(self, payment):
        try:
            data = json.loads(payment.docto_relacionados)
        except Exception:
            data = []
        return data

    def _compute_different_currency(self):
        for payment in self:
            if payment.reconciled_invoice_ids:
                for invoice in payment.reconciled_invoice_ids:
                    if invoice.currency_id != payment.currency_id:
                        payment.different_currency = True
                        break
                    else:
                        payment.different_currency = False
            else:
                payment.different_currency = False

    def importar_incluir_cep(self):
        ctx = {'default_payment_id': self.id}
        return {
            'name': _('Importar factura de compra'),
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': self.env.ref('cdfi_invoice.view_import_xml_payment_in_payment_form_view').id,
            'res_model': 'import.account.payment.from.xml',
            'context': ctx,
            'type': 'ir.actions.act_window',
            'target': 'new',
        }

    @api.onchange('journal_id')
    def _onchange_journal(self):
        if self.journal_id:
            self.currency_id = self.journal_id.currency_id or self.company_id.currency_id
            # Set default payment method (we consider the first to be the default one)
            payment_methods = self.payment_type == 'inbound' and self.journal_id.inbound_payment_method_line_ids or self.journal_id.outbound_payment_method_line_ids
            self.payment_method_line_id = payment_methods and payment_methods[0] or False
            # Set payment method domain (restrict to methods enabled for the journal and to selected payment type)
            payment_type = self.payment_type in ('outbound', 'transfer') and 'outbound' or 'inbound'
            self.forma_pago_id = self.journal_id.forma_pago_id.id
            return {'domain': {
                'payment_method_line_id': [('payment_type', '=', payment_type), ('id', 'in', payment_methods.ids)]}}
        return {}

    # @api.onchange('date')
    # def _onchange_payment_date(self):
    #     if self.date:
    #         self.fecha_pago = datetime.combine((self.date), datetime.max.time())

    def add_resitual_amounts(self):
        for payment in self:
            no_decimales = payment.currency_id.no_decimales
            no_decimales_tc = payment.currency_id.no_decimales_tc
            docto_relacionados = []
            tax_grouped_tras = {}
            tax_grouped_ret = {}
            mxn_currency = self.env["res.currency"].search([('name', '=', 'MXN')], limit=1)

            if payment.reconciled_invoice_ids:
                if payment.manual_partials:
                    for partial in payment.partials_payment_ids:
                        equivalenciadr = partial.equivalenciadr
                        if equivalenciadr == 0:
                            raise UserError("La equivalencia debe ser diferente de cero.")

                        if partial.facturas_id.total_factura <= 0:
                            raise UserError(
                                "No hay monto total de la factura. Carga el XML en la factura para agregar el monto total.")

                        paid_pct = float_round(partial.imp_pagado, precision_digits=6,
                                               rounding_method='UP') / partial.facturas_id.total_factura

                        if not partial.facturas_id.tax_payment:
                            raise UserError(
                                "No hay información de impuestos en el documento. Carga el XML en la factura para agregar los impuestos.")

                        taxes = json.loads(partial.facturas_id.tax_payment)
                        objetoimpdr = '01'
                        trasladodr = []
                        retenciondr = []
                        if "translados" in taxes:
                            objetoimpdr = '02'
                            traslados = taxes['translados']
                            for traslado in traslados:
                                basedr = float_round(float(traslado['base']) * paid_pct, precision_digits=2,
                                                     rounding_method='UP')
                                importedr = traslado['importe'] and float_round(float(traslado['tasa']) * basedr,
                                                                                precision_digits=2,
                                                                                rounding_method='UP') or 0
                                trasladodr.append({
                                    'BaseDR': payment.set_decimals(basedr, 2),
                                    'ImpuestoDR': traslado['impuesto'],
                                    'TipoFactorDR': traslado['TipoFactor'],
                                    'TasaOcuotaDR': traslado['tasa'],
                                    'ImporteDR': payment.set_decimals(importedr, 2) if traslado[
                                                                                           'TipoFactor'] != 'Exento' else '',
                                })
                                key = traslado['tax_id']

                                if equivalenciadr == 1:
                                    basep = basedr
                                    importep = importedr
                                else:
                                    basep = basedr / equivalenciadr
                                    importep = importedr / equivalenciadr

                                val = {'BaseP': basep,
                                       'ImpuestoP': traslado['impuesto'],
                                       'TipoFactorP': traslado['TipoFactor'],
                                       'TasaOCuotaP': traslado['tasa'],
                                       'ImporteP': importep, }
                                if key not in tax_grouped_tras:
                                    tax_grouped_tras[key] = val
                                else:
                                    tax_grouped_tras[key]['BaseP'] += basep
                                    tax_grouped_tras[key]['ImporteP'] += importep
                        if "retenciones" in taxes:
                            objetoimpdr = '02'
                            retenciones = taxes['retenciones']
                            for retencion in retenciones:
                                basedr = float_round(float(retencion['base']) * paid_pct, precision_digits=2,
                                                     rounding_method='UP')
                                importedr = retencion['importe'] and float_round(float(retencion['tasa']) * basedr,
                                                                                 precision_digits=2,
                                                                                 rounding_method='UP') or 0
                                retenciondr.append({
                                    'BaseDR': payment.set_decimals(basedr, 2),
                                    'ImpuestoDR': retencion['impuesto'],
                                    'TipoFactorDR': retencion['TipoFactor'],
                                    'TasaOcuotaDR': retencion['tasa'],
                                    'ImporteDR': payment.set_decimals(importedr, 2),
                                })
                                key = retencion['tax_id']

                                if equivalenciadr == 1:
                                    importep = importedr
                                else:
                                    importep = importedr / equivalenciadr

                                val = {'ImpuestoP': retencion['impuesto'],
                                       'ImporteP': importep, }
                                if key not in tax_grouped_ret:
                                    tax_grouped_ret[key] = val
                                else:
                                    tax_grouped_ret[key]['ImporteP'] += importep

                        #if len(payment.partials_payment_ids) > 1 and payment.different_currency:
                        #    if equivalenciadr == 1:
                        #        equivalenciadr = payment.set_decimals(equivalenciadr, 10)
                        docto_relacionados.append({
                            'MonedaDR': partial.facturas_id.moneda,
                            'EquivalenciaDR': equivalenciadr,
                            'IdDocumento': partial.facturas_id.folio_fiscal,
                            'folio_facura': partial.facturas_id.number_folio,
                            'NumParcialidad': partial.parcialidad,
                            'ImpSaldoAnt': partial.imp_saldo_ant,
                            'ImpPagado': partial.imp_pagado,
                            'ImpSaldoInsoluto': partial.imp_saldo_insoluto,
                            'ObjetoImpDR': objetoimpdr,
                            'ImpuestosDR': {'traslados': trasladodr, 'retenciones': retenciondr, },
                        })

                    payment.write({'docto_relacionados': json.dumps(docto_relacionados),
                                   'retencionesp': json.dumps(tax_grouped_ret),
                                   'trasladosp': json.dumps(tax_grouped_tras), })
                else:
                    pay_rec_lines = payment.move_id.line_ids.filtered(
                        lambda line: line.account_type in ('asset_receivable', 'liability_payable'))
                    if payment.currency_id == mxn_currency:
                        rate_payment_curr_mxn = None
                        paid_amount_comp_curr = payment.amount
                    else:
                        rate_payment_curr_mxn = payment.currency_id._convert(1.0, mxn_currency, payment.company_id, payment.date, round=False)
                        paid_amount_comp_curr = payment.currency_id.round(payment.amount * rate_payment_curr_mxn)

                    for match_field in ('credit', 'debit'):
                        for partial in pay_rec_lines[f'matched_{match_field}_ids']:
                            payment_line = partial[f'{match_field}_move_id']
                            invoice_line = partial[f'{match_field}_move_id']
                            invoice_amount = partial[f'{match_field}_amount_currency']
                            invoice = invoice_line.move_id
                            decimal_p = 2

                            exchange_number = 0
                            exchange_amount = 0
                            for exchange in partial.exchange_move_id:
                                 exchange_amount += exchange.amount_total
                                 exchange_number += 1 

                            if partial.amount == 0:
                                raise UserError(
                                    "Una factura adjunta en el pago no tiene un monto liquidado por el pago. \nRevisa que todas las facturas tengan un monto pagado, puede ser necesario desvincular las facturas y vinculalas en otro orden.")

                            if not invoice.factura_cfdi:
                                continue

                            payment_content = len(invoice.invoice_payments_widget['content']) - exchange_number

                            if invoice.total_factura <= 0:
                                raise UserError(
                                    "No hay monto total de la factura. Carga el XML en la factura para agregar el monto total.")

                            if invoice.currency_id == payment.currency_id:
                                amount_paid_invoice_curr = invoice_amount
                                equivalenciadr = 1
                            elif invoice.currency_id == mxn_currency and invoice.currency_id != payment.currency_id:
                                amount_paid_invoice_curr = invoice_amount
                                amount_paid_invoice_comp_curr = payment_line.company_currency_id.round(
                                    payment.amount * (abs(payment_line.balance) / (paid_amount_comp_curr + exchange_amount)))
                                invoice_rate = partial.debit_amount_currency / (partial.amount  + exchange_amount)
                                exchange_rate = amount_paid_invoice_curr / amount_paid_invoice_comp_curr
                                equivalenciadr = payment.roundTraditional(exchange_rate, 6) + 0.000001
                            else:
                                amount_paid_invoice_curr = invoice_amount
                                exchange_rate = partial.debit_amount_currency / (partial.amount  + exchange_amount)
                                equivalenciadr = payment.roundTraditional(exchange_rate, 6)# + 0.000001
                            paid_pct = float_round(amount_paid_invoice_curr, precision_digits=6,
                                                   rounding_method='UP') / invoice.total_factura

                            if not invoice.tax_payment:
                                raise UserError(
                                    "No hay información de impuestos en el documento. Carga el XML en la factura para agregar los impuestos.")

                            taxes = json.loads(invoice.tax_payment)
                            objetoimpdr = '01'
                            trasladodr = []
                            retenciondr = []
                            if "translados" in taxes:
                                objetoimpdr = '02'
                                traslados = taxes['translados']
                                for traslado in traslados:
                                    basedr = float_round(float(traslado['base']) * paid_pct, precision_digits=decimal_p,
                                                         rounding_method='UP')
                                    importedr = traslado['importe'] and float_round(float(traslado['tasa']) * basedr,
                                                                                    precision_digits=decimal_p,
                                                                                    rounding_method='UP') or 0
                                    trasladodr.append({
                                        'BaseDR': payment.set_decimals(basedr, decimal_p),
                                        'ImpuestoDR': traslado['impuesto'],
                                        'TipoFactorDR': traslado['TipoFactor'],
                                        'TasaOcuotaDR': traslado['tasa'],
                                        'ImporteDR': payment.set_decimals(importedr, decimal_p) if traslado[
                                                                                                       'TipoFactor'] != 'Exento' else '',
                                    })
                                    key = traslado['tax_id']

                                    if equivalenciadr == 1:
                                        basep = basedr
                                        importep = importedr
                                    else:
                                        basep = basedr / equivalenciadr
                                        importep = importedr / equivalenciadr

                                    val = {'BaseP': basep,
                                           'ImpuestoP': traslado['impuesto'],
                                           'TipoFactorP': traslado['TipoFactor'],
                                           'TasaOCuotaP': traslado['tasa'],
                                           'ImporteP': importep, }
                                    if key not in tax_grouped_tras:
                                        tax_grouped_tras[key] = val
                                    else:
                                        tax_grouped_tras[key]['BaseP'] += basep
                                        tax_grouped_tras[key]['ImporteP'] += importep
                            if "retenciones" in taxes:
                                objetoimpdr = '02'
                                retenciones = taxes['retenciones']
                                for retencion in retenciones:
                                    basedr = float_round(float(retencion['base']) * paid_pct,
                                                         precision_digits=decimal_p, rounding_method='UP')
                                    importedr = retencion['importe'] and float_round(float(retencion['tasa']) * basedr,
                                                                                     precision_digits=decimal_p,
                                                                                     rounding_method='UP') or 0
                                    retenciondr.append({
                                        'BaseDR': payment.set_decimals(basedr, decimal_p),
                                        'ImpuestoDR': retencion['impuesto'],
                                        'TipoFactorDR': retencion['TipoFactor'],
                                        'TasaOcuotaDR': retencion['tasa'],
                                        'ImporteDR': payment.set_decimals(importedr, decimal_p),
                                    })
                                    key = retencion['tax_id']

                                    if equivalenciadr == 1:
                                        importep = importedr
                                    else:
                                        importep = importedr / equivalenciadr

                                    val = {'ImpuestoP': retencion['impuesto'],
                                           'ImporteP': importep, }
                                    if key not in tax_grouped_ret:
                                        tax_grouped_ret[key] = val
                                    else:
                                        tax_grouped_ret[key]['ImporteP'] += importep

                            #if len(payment.reconciled_invoice_ids) > 1 and payment.different_currency:
                            #    if equivalenciadr == 1:
                            #        equivalenciadr = payment.set_decimals(equivalenciadr, 10)

                            docto_relacionados.append({
                                'MonedaDR': invoice.moneda,
                                'EquivalenciaDR': equivalenciadr,
                                'IdDocumento': invoice.folio_fiscal,
                                'folio_facura': invoice.number_folio,
                                'NumParcialidad': payment_content,
                                'ImpSaldoAnt': float_round(
                                    min(invoice.amount_residual + amount_paid_invoice_curr, invoice.amount_total),
                                    precision_digits=decimal_p, rounding_method='UP'),
                                'ImpPagado': float_round(amount_paid_invoice_curr, precision_digits=decimal_p,
                                                         rounding_method='UP'),
                                'ImpSaldoInsoluto': round(float_round(
                                    min(invoice.amount_residual + amount_paid_invoice_curr, invoice.amount_total),
                                    precision_digits=decimal_p, rounding_method='UP') - \
                                                          float_round(amount_paid_invoice_curr,
                                                                      precision_digits=decimal_p, rounding_method='UP'),
                                                          2),
                                'ObjetoImpDR': objetoimpdr,
                                'ImpuestosDR': {'traslados': trasladodr, 'retenciones': retenciondr, },
                            })

                    payment.write({'docto_relacionados': json.dumps(docto_relacionados),
                                   'retencionesp': json.dumps(tax_grouped_ret),
                                   'trasladosp': json.dumps(tax_grouped_tras), })

    def post(self):
        res = super(AccountPayment, self).post()
        for rec in self:
            #        rec.add_resitual_amounts()
            rec._onchange_payment_date()
            rec._onchange_journal()
        return res

    @api.depends('amount')
    def _compute_monto_pagar(self):
        for record in self:
            if record.amount:
                record.monto_pagar = record.amount
            else:
                record.monto_pagar = 0

    @api.depends('journal_id')
    def _compute_banco_receptor(self):
        for record in self:
            if record.journal_id and record.journal_id.bank_id:
                record.banco_receptor = record.journal_id.bank_id.name
                record.rfc_banco_receptor = record.journal_id.bank_id.bic
            else:
                record.banco_receptor = ''
                record.rfc_banco_receptor = ''
                record.cuenta_beneficiario = ''
            if record.journal_id:
                record.cuenta_beneficiario = record.journal_id.bank_acc_number
            else:
                record.banco_receptor = ''
                record.rfc_banco_receptor = ''
                record.cuenta_beneficiario = ''

    @api.depends('amount', 'currency_id')
    def _get_amount_to_text(self):
        for record in self:
            record.amount_to_text = amount_to_text_es_MX.get_amount_to_text(record, record.amount_total, 'es_cheque',
                                                                            record.currency_id.name)

    @api.model
    def _get_amount_2_text(self, amount_total):
        return amount_to_text_es_MX.get_amount_to_text(self, amount_total, 'es_cheque', self.currency_id.name)

    @api.model
    def to_json(self):
        if self.partner_id.vat == 'XAXX010101000' or self.partner_id.vat == 'XEXX010101000':
            zipreceptor = self.journal_id.codigo_postal or self.company_id.zip
        else:
            zipreceptor = self.partner_id.zip

        no_decimales = self.currency_id.no_decimales
        no_decimales_tc = self.currency_id.no_decimales_tc

        self.monedap = self.currency_id.name
        if self.currency_id.name == 'MXN':
            self.tipocambiop = '1'
        else:
            self.tipocambiop = self.set_decimals(1 / self.currency_id.with_context(date=self.date).rate,
                                                 no_decimales_tc)

        timezone = self._context.get('tz')
        if not timezone:
            timezone = self.env.user.partner_id.tz or 'America/Mexico_City'
        # timezone = tools.ustr(timezone).encode('utf-8')

        if not self.fecha_pago:
            raise UserError(_('Falta configurar fecha de pago en la sección de CFDI del documento.'))
        else:
            local = pytz.timezone(timezone)
            naive_from = self.fecha_pago
            local_dt_from = naive_from.replace(tzinfo=pytz.UTC).astimezone(local)
            date_from = local_dt_from.strftime("%Y-%m-%dT%H:%M:%S")
        self.add_resitual_amounts()

        # corregir hora
        local2 = pytz.timezone(timezone)
        if not self.date_payment:
            naive_from2 = datetime.now()
        else:
            naive_from2 = self.date_payment
        local_dt_from2 = naive_from2.replace(tzinfo=pytz.UTC).astimezone(local2)
        date_cfdi = local_dt_from2.strftime("%Y-%m-%dT%H:%M:%S")
        if not self.date_payment:
            self.date_payment = datetime.now()

        self.check_cfdi_values()

        conceptos = []
        conceptos.append({
            'ClaveProdServ': '84111506',
            'ClaveUnidad': 'ACT',
            'cantidad': 1,
            'descripcion': 'Pago',
            'valorunitario': '0',
            'importe': '0',
            'ObjetoImp': '01',
        })

        taxes_traslado = json.loads(self.trasladosp)
        taxes_retenciones = json.loads(self.retencionesp)
        impuestosp = {}
        totales = {}
        self.total_pago = 0
        if taxes_traslado or taxes_retenciones:
            retencionp = []
            trasladop = []
            if taxes_traslado:
                for line in taxes_traslado.values():
                    trasladop.append({'ImpuestoP': line['ImpuestoP'],
                                      'TipoFactorP': line['TipoFactorP'],
                                      'TasaOCuotaP': line['TasaOCuotaP'],
                                      'ImporteP': self.roundTraditional(line['ImporteP'], 2) if line['TipoFactorP'] != 'Exento' else '',
                                      'BaseP': self.roundTraditional(line['BaseP'], 2),
                                      })
                    if line['ImpuestoP'] == '002' and line['TasaOCuotaP'] == '0.160000':
                        totales.update({'TotalTrasladosBaseIVA16': self.selectRoundseparate(
                            line['BaseP'] * float(self.tipocambiop), 2, self.redondeo_t_base),
                                        'TotalTrasladosImpuestoIVA16': self.selectRoundseparate(
                                            line['ImporteP'] * float(self.tipocambiop),2, self.redondeo_t_impuesto),})
                    if line['ImpuestoP'] == '002' and line['TasaOCuotaP'] == '0.080000':
                        totales.update({'TotalTrasladosBaseIVA8': self.roundTraditional(
                            line['BaseP'] * float(self.tipocambiop), 2),
                                        'TotalTrasladosImpuestoIVA8': self.roundTraditional(
                                            line['ImporteP'] * float(self.tipocambiop), 2), })
                    if line['ImpuestoP'] == '002' and line['TasaOCuotaP'] == '0.000000':
                        totales.update({'TotalTrasladosBaseIVA0': self.roundTraditional(
                            line['BaseP'] * float(self.tipocambiop), 2),
                                        'TotalTrasladosImpuestoIVA0': self.roundTraditional(
                                            line['ImporteP'] * float(self.tipocambiop), 2), })
                    if line['ImpuestoP'] == '002' and line['TipoFactorP'] == 'Exento':
                        totales.update({'TotalTrasladosBaseIVAExento': self.roundTraditional(
                            line['BaseP'] * float(self.tipocambiop), 2), })
                    if line['TipoFactorP'] != 'Exento':
                        self.total_pago += round(line['BaseP'] * float(self.tipocambiop), 2) + round(
                            line['ImporteP'] * float(self.tipocambiop), 2)
                    else:
                        self.total_pago += round(line['BaseP'] * float(self.tipocambiop), 2)
                impuestosp.update({'TrasladosP': trasladop})
            if taxes_retenciones:
                for line in taxes_retenciones.values():
                    retencionp.append({'ImpuestoP': line['ImpuestoP'],
                                       'ImporteP': self.set_decimals(line['ImporteP'], 2),
                                       })
                    if line['ImpuestoP'] == '002':
                        totales.update({'TotalRetencionesIVA': self.roundTraditional(
                            line['ImporteP'] * float(self.tipocambiop), 2), })
                    if line['ImpuestoP'] == '001':
                        totales.update({'TotalRetencionesISR': self.roundTraditional(
                            line['ImporteP'] * float(self.tipocambiop), 2), })
                    if line['ImpuestoP'] == '003':
                        totales.update({'TotalRetencionesIEPS': self.roundTraditional(
                            line['ImporteP'] * float(self.tipocambiop), 2), })
                    self.total_pago -= round(line['ImporteP'] * float(self.tipocambiop), 2)
                impuestosp.update({'RetencionesP': retencionp})
        totales.update({'MontoTotalPagos': self.set_decimals(self.amount,2) 
                                           if self.monedap == 'MXN' 
                                           else self.selectRoundseparate(self.amount * float(self.tipocambiop), 2, self.redondeo_t_total), })
        # totales.update({'MontoTotalPagos': self.set_decimals(self.total_pago, 2),})

        pagos = []
        pagos.append({
            'FechaPago': date_from,
            'FormaDePagoP': self.forma_pago_id.code,
            'MonedaP': self.monedap,
            'TipoCambioP': self.tipocambiop,  # if self.monedap != 'MXN' else '1',
            'Monto': self.set_decimals(self.amount, no_decimales),
            # 'Monto':  self.set_decimals(self.total_pago/float(self.tipocambiop), no_decimales),
            'NumOperacion': self.numero_operacion,

            'RfcEmisorCtaOrd': self.rfc_banco_emisor if self.forma_pago_id.code in ['02', '03', '04', '05', '28',
                                                                                    '29'] else '',
            'NomBancoOrdExt': self.banco_emisor if self.forma_pago_id.code in ['02', '03', '04', '05', '28',
                                                                               '29'] else '',
            'CtaOrdenante': self.cuenta_emisor.acc_number if self.cuenta_emisor and self.forma_pago_id.code in ['02',
                                                                                                                '03',
                                                                                                                '04',
                                                                                                                '05',
                                                                                                                '28',
                                                                                                                '29'] else '',
            'RfcEmisorCtaBen': self.rfc_banco_receptor if self.forma_pago_id.code in ['02', '03', '04', '05', '28',
                                                                                      '29'] else '',
            'CtaBeneficiario': self.cuenta_beneficiario if self.forma_pago_id.code in ['02', '03', '04', '05', '28',
                                                                                       '29'] else '',
            'DoctoRelacionado': json.loads(self.docto_relacionados),
            'ImpuestosP': impuestosp,
        })

        if self.reconciled_invoice_ids:
            request_params = {
                'factura': {
                    'serie': str(re.sub(r'[0-9]+', '', self.name)).replace('/', '').replace('.', ''),
                    'folio': str(re.sub('[^0-9]','', self.name)),
                    'fecha_expedicion': date_cfdi,
                    'subtotal': '0',
                    'moneda': 'XXX',
                    'total': '0',
                    'tipocomprobante': 'P',
                    'LugarExpedicion': self.journal_id.codigo_postal or self.company_id.zip,
                    'confirmacion': self.confirmacion,
                    'Exportacion': '01',
                },
                'emisor': {
                    'rfc': self.company_id.vat.upper(),
                    'nombre': self.company_id.nombre_fiscal.upper(),
                    'RegimenFiscal': self.company_id.regimen_fiscal_id.code,
                },
                'receptor': {
                    'nombre': self.partner_id.name.upper(),
                    'rfc': self.partner_id.vat.upper(),
                    'ResidenciaFiscal': self.partner_id.country_id.codigo_mx if self.partner_id.country_id.code != 'MX' else '',
                    'NumRegIdTrib': self.partner_id.vat.upper() if self.partner_id.country_id.code != 'MX' else '',
                    'UsoCFDI': 'CP01',
                    'RegimenFiscalReceptor': self.partner_id.regimen_fiscal_id.code,
                    'DomicilioFiscalReceptor': zipreceptor,
                },

                'informacion': {
                    'cfdi': '4.0',
                    'sistema': 'odoo17',
                    'version': '6',
                    'api_key': self.company_id.proveedor_timbrado,
                    'modo_prueba': self.company_id.modo_prueba,
                },

                'conceptos': conceptos,

                'totales': totales,

                'pagos20': {'Pagos': pagos},

            }

            if self.uuid_relacionado:
                cfdi_relacionado = []
                uuids = self.uuid_relacionado.replace(' ', '').split(',')
                for uuid in uuids:
                    cfdi_relacionado.append({
                        'uuid': uuid,
                    })
                request_params.update(
                    {'CfdisRelacionados': {'UUID': cfdi_relacionado, 'TipoRelacion': self.tipo_relacion}})

        else:
            raise UserError(
                _('No tiene ninguna factura ligada al documento de pago, debe al menos tener una factura ligada. \n Desde la factura crea el pago para que se asocie la factura al pago.'))
        return request_params

    def check_cfdi_values(self):
        if not self.company_id.vat:
            raise UserError(_('El emisor no tiene RFC configurado.'))
        if not self.company_id.name:
            raise UserError(_('El emisor no tiene nombre configurado.'))
        if not self.partner_id.vat:
            raise UserError(_('El receptor no tiene RFC configurado.'))
        if not self.company_id.regimen_fiscal_id:
            raise UserError(_('El emisor no régimen fiscal configurado.'))
        if not self.journal_id.codigo_postal and not self.company_id.zip:
            raise UserError(_('El emisor no tiene código postal configurado.'))
        if not self.forma_pago_id:
            raise UserError(_('Falta configurar la forma de pago.'))

    def set_decimals(self, amount, precision):
        if amount is None or amount is False:
            return None
        return '%.*f' % (precision, amount)

    def roundTraditional(self, val, digits):
       if val != 0:
          return round(val + 10 ** (-len(str(val)) - 1), digits)
       else:
          return 0

    def trunc(self, val, digits):
       if val != 0:
          x = 10 ** digits
          return int(val*x)/(x)
       else:
          return 0

    def selectRoundseparate(self, val, digits, r_option):
       if r_option == '01':
           return self.roundTraditional(val, digits)
       elif r_option == '02':
           return self.set_decimals(val, digits)
       elif r_option == '03':
           return math.ceil(val*100)/100
       else:
           return self.trunc(val, digits)

    def clean_text(self, text):
        clean_text = text.replace('\n', ' ').replace('\\', ' ').replace('-', ' ').replace('/', ' ').replace('|', ' ')
        clean_text = clean_text.replace(',', ' ').replace(';', ' ').replace('>', ' ').replace('<', ' ')
        return clean_text[:1000]

    def complete_payment(self):
        for p in self:
            if p.folio_fiscal:
                p.write({'estado_pago': 'pago_correcto'})
                return True

            values = p.to_json()
            if p.company_id.proveedor_timbrado == 'servidor':
                url = '%s' % ('https://facturacion.itadmin.com.mx/api/payment')
            elif p.company_id.proveedor_timbrado == 'servidor2':
                url = '%s' % ('https://facturacion2.itadmin.com.mx/api/payment')
            else:
                raise UserError(_('Error, falta seleccionar el servidor de timbrado en la configuración de la compañía.'))

            try:
                response = requests.post(url,
                                         auth=None, data=json.dumps(values),
                                         headers={"Content-type": "application/json"})
            except Exception as e:
                error = str(e)
                if "Name or service not known" in error or "Failed to establish a new connection" in error:
                    raise UserError(_('Servidor fuera de servicio, favor de intentar mas tarde'))
                else:
                    raise UserError(_(error))

            if "Whoops, looks like something went wrong." in response.text:
                raise UserError(
                    _('Error en el proceso de timbrado, espere un minuto y vuelva a intentar timbrar nuevamente. \nSi el error aparece varias veces reportarlo con la persona de sistemas.'))
            else:
                json_response = response.json()
            xml_file_link = False
            estado_pago = json_response['estado_pago']
            if estado_pago == 'problemas_pago':
                raise UserError(_(json_response['problemas_message']))
            # Receive and stroe XML 
            if json_response.get('pago_xml'):
                p._set_data_from_xml(base64.b64decode(json_response['pago_xml']))

                xml_file_name = p.name.replace('.', '').replace('/', '_') + '.xml'
                attach = p.env['ir.attachment'].sudo().create(
                    {
                        'name': xml_file_name,
                        'datas': json_response['pago_xml'],
                     # 'datas_fname': xml_file_name,
                        'res_model': p._name,
                        'res_id': p.id,
                        'type': 'binary',
                        'mimetype': 'application/xml',
                        'description': _('Factura CFDI del documento %s.') % p.name,
                    })
                if p.move_id:
                   cfdi_format = p.env.ref('cdfi_invoice.edi_cfdi_4_0')
                   edi_doc = p.env['account.edi.document'].sudo().create({
                       'edi_format_id': cfdi_format.id,
                       'state': 'sent',
                       'move_id': p.move_id.id,
                       'attachment_id': attach.id,
                   })
            p.write({'estado_pago': estado_pago,
                     'xml_payment_link': xml_file_link})
            p.message_post(body="CFDI emitido")

    def _set_data_from_xml(self, xml_payment):
        if not xml_payment:
            return None
        NSMAP = {
            'xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'cfdi': 'http://www.sat.gob.mx/cfd/4',
            'tfd': 'http://www.sat.gob.mx/TimbreFiscalDigital',
            'pago20': 'http://www.sat.gob.mx/Pagos20',
        }
        xml_data = etree.fromstring(xml_payment)
        Complemento = xml_data.find('cfdi:Complemento', NSMAP)
        TimbreFiscalDigital = Complemento.find('tfd:TimbreFiscalDigital', NSMAP)

        self.numero_cetificado = xml_data.attrib['NoCertificado']
        self.fecha_emision = xml_data.attrib['Fecha']
        self.cetificaso_sat = TimbreFiscalDigital.attrib['NoCertificadoSAT']
        self.fecha_certificacion = TimbreFiscalDigital.attrib['FechaTimbrado']
        self.selo_digital_cdfi = TimbreFiscalDigital.attrib['SelloCFD']
        self.selo_sat = TimbreFiscalDigital.attrib['SelloSAT']
        self.folio_fiscal = TimbreFiscalDigital.attrib['UUID']
        #self.folio = xml_data.attrib['Folio']
        version = TimbreFiscalDigital.attrib['Version']
        self.cadena_origenal = '||%s|%s|%s|%s|%s||' % (version, self.folio_fiscal, self.fecha_certificacion,
                                                       self.selo_digital_cdfi, self.cetificaso_sat)

        options = {'width': 275 * mm, 'height': 275 * mm}
        qr_value = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?&id=%s&re=%s&rr=%s&tt=%s.%s&fe=%s' % (
        self.folio_fiscal,
        self.company_id.vat,
        self.partner_id.vat,
        '0000000000',
        '000000',
        self.selo_digital_cdfi[-8:],
        )
        self.qr_value = qr_value
        ret_val = createBarcodeDrawing('QR', value=qr_value, **options)
        self.qrcode_image = base64.encodebytes(ret_val.asString('jpg'))

    def send_payment(self):
        self.ensure_one()
        _logger.info('attach00')
        attachments = []
        _logger.info('attach01')
        domain = [
            ('res_id', '=', self.id),
            ('res_model', '=', self._name),
            ('name', '=', self.name.replace('.', '').replace('/', '_') + '.xml')]
        xml_file = self.env['ir.attachment'].search(domain, limit=1)
        if xml_file:
            _logger.info('attach02')
            _logger.info('pay_mail08')
            attachments.append((self.name.replace('.', '').replace('/', '_') + '.xml', xml_file.datas))

        _logger.info('send_mail01')
        template = self.env.ref('cdfi_invoice.email_template_payment', False)
        _logger.info('send_mail02')
        compose_form = self.env.ref('mail.email_compose_message_wizard_form', False)
        _logger.info('send_mail03')
        ctx = dict()
        ctx.update({
            'default_model': 'account.payment',
            'default_res_ids': [self.id],
            'default_use_template': bool(template),
            'default_template_id': template.id,
            'default_composition_mode': 'comment',
            #        'default_attachment_ids': attachments,
        })
        _logger.info('send_mail04')
        return {
            'name': _('Compose Email'),
            'type': 'ir.actions.act_window',
            'view_type': 'form',
            'view_mode': 'form',
            'res_model': 'mail.compose.message',
            'views': [(compose_form.id, 'form')],
            'view_id': compose_form.id,
            'target': 'new',
            'context': ctx,

        }

    def action_cfdi_cancel(self):
        for p in self:
            # if invoice.factura_cfdi:
            if p.estado_pago == 'factura_cancelada':
                pass
                # raise UserError(_('La factura ya fue cancelada, no puede volver a cancelarse.'))
            if not p.company_id.archivo_cer:
                raise UserError(_('Falta la ruta del archivo .cer'))
            if not p.company_id.archivo_key:
                raise UserError(_('Falta la ruta del archivo .key'))
            archivo_cer = p.company_id.archivo_cer.decode("utf-8")
            archivo_key = p.company_id.archivo_key.decode("utf-8")

            domain = [
                ('res_id', '=', p.id),
                ('res_model', '=', p._name),
                ('name', '=', p.name.replace('.', '').replace('/', '_') + '.xml')]
            xml_file = p.env['ir.attachment'].search(domain)[0]
            if not xml_file:
                raise UserError(_('No se encontró el archivo XML para enviar a cancelar.'))
            values = {
                'rfc': p.company_id.vat,
                'api_key': p.company_id.proveedor_timbrado,
                'uuid': p.folio_fiscal,
                'folio': str(re.sub('[^0-9]','', p.name)),
                'serie_factura': str(re.sub(r'[0-9]+', '', p.name)).replace('/', '').replace('.', ''),
                'modo_prueba': p.company_id.modo_prueba,
                'certificados': {
                    'archivo_cer': archivo_cer,
                    'archivo_key': archivo_key,
                    'contrasena': p.company_id.contrasena,
                },
                'xml': xml_file.datas.decode("utf-8"),
                'motivo': p.env.context.get('motivo_cancelacion', '02'),
                'foliosustitucion': p.env.context.get('foliosustitucion', ''),
            }
            if p.company_id.proveedor_timbrado == 'servidor':
                url = '%s' % ('https://facturacion.itadmin.com.mx/api/refund')
            elif p.company_id.proveedor_timbrado == 'servidor2':
                url = '%s' % ('https://facturacion2.itadmin.com.mx/api/refund')
            else:
                raise UserError(_('Error, falta seleccionar el servidor de timbrado en la configuración de la compañía.'))

            response = requests.post(url,
                                     auth=None, data=json.dumps(values),
                                     headers={"Content-type": "application/json"})

            json_response = response.json()

            if json_response['estado_factura'] == 'problemas_factura':
                raise UserError(_(json_response['problemas_message']))
            elif json_response.get('factura_xml', False):
                file_name = 'CANCEL_' + p.name.replace('.', '').replace('/', '_') + '.xml'
                p.env['ir.attachment'].sudo().create({
                    'name': file_name,
                    'datas': json_response['factura_xml'],
                    # 'datas_fname': file_name,
                    'res_model': p._name,
                    'res_id': p.id,
                    'type': 'binary'
                })
            p.write({'estado_pago': json_response['estado_factura']})
            p.message_post(body="CFDI Cancelado")

    def truncate(self, number, decimals=0):
        """
        Returns a value truncated to a specific number of decimal places.
        """
        if not isinstance(decimals, int):
            raise TypeError("decimal places must be an integer.")
        elif decimals < 0:
            raise ValueError("decimal places has to be 0 or more.")
        elif decimals == 0:
            return math.trunc(number)

        factor = 10.0 ** decimals
        return math.trunc(number * factor) / factor

    def get_name(self):
        for payment in self:
            return payment.name.replace('.', '').replace('/', '_')


class MailComposeMessage(models.TransientModel):
    _inherit = 'mail.compose.message'

    def _compute_attachment_ids(self):
        res = super(MailComposeMessage, self)._compute_attachment_ids()
        for rec in self:
            if self.model == 'account.payment':
                attachment_ids=[]
                template_id = self.env.ref('cdfi_invoice.email_template_payment')
                if self.template_id.id == template_id.id:
                    res_ids = ast.literal_eval(self.res_ids)
                    for res_id in res_ids:
                        payment = self.env[self.model].browse(res_id)
                        domain = [
                            ('res_id', '=', payment.id),
                            ('res_model', '=', payment._name),
                            ('name', '=', payment.name.replace('.', '').replace('/', '_') + '.xml')]
                        xml_file = self.env['ir.attachment'].search(domain, limit=1)
                        if xml_file:
                            attachment_ids.extend(rec.attachment_ids.ids)
                            attachment_ids.append(xml_file.id)
                    if attachment_ids:
                        rec.attachment_ids = [(6, 0, attachment_ids)]
        return res


class AccountPaymentMail(models.Model):
    _name = "account.payment.mail"
    _inherit = ['mail.thread']
    _description = "Payment Mail"

    payment_id = fields.Many2one('account.payment', string='Payment')
    name = fields.Char(related='payment_id.name')
    xml_payment_link = fields.Char(related='payment_id.xml_payment_link')
    partner_id = fields.Many2one(related='payment_id.partner_id')
    company_id = fields.Many2one(related='payment_id.company_id')


class AccountPaymentTerm(models.Model):
    "Terminos de pago"
    _inherit = "account.payment.term"

    methodo_pago = fields.Selection(
        selection=[('PUE', _('Pago en una sola exhibición')),
                   ('PPD', _('Pago en parcialidades o diferido')), ],
        string=_('Método de pago'),
    )
    forma_pago_id = fields.Many2one('catalogo.forma.pago', string='Forma de pago')
    company_cfdi = fields.Boolean(string='Compania CFDI', compute='_get_company')

    @api.depends('company_id')
    def _get_company(self):
        for record in self:
            if record.company_id:
                record.company_cfdi = record.company_id.company_cfdi
            else:
                record.company_cfdi = True


class FacturasPago(models.Model):
    _name = "facturas.pago"
    _description = 'Facturas ligadas a pago'

    doc_id = fields.Many2one('account.payment', 'Pago ligado')
    facturas_id = fields.Many2one('account.move', string='Factura')
    parcialidad = fields.Integer("Parcialidad")
    imp_saldo_ant = fields.Float("ImpSaldoAnt")
    imp_pagado = fields.Float("ImpPagado")
    imp_saldo_insoluto = fields.Float("ImpSaldoInsoluto", compute='_compute_insoluto')
    equivalenciadr = fields.Float("EquivalenciaDR", digits=(12, 10), default=1)

    @api.depends('imp_saldo_ant', 'imp_pagado')
    def _compute_insoluto(self):
        for rec in self:
            rec.imp_saldo_insoluto = rec.imp_saldo_ant - rec.imp_pagado

    @api.onchange('facturas_id')
    def _compute_saldo_ant(self):
        for rec in self:
            if rec.facturas_id:
                rec.imp_saldo_ant = rec.facturas_id.amount_total_in_currency_signed
