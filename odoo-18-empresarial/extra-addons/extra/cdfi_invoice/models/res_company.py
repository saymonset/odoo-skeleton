# -*- coding: utf-8 -*-

import base64
import json
import requests
from odoo import fields, models, api, _
from odoo.exceptions import UserError
from datetime import datetime, timedelta
from dateutil import parser

class ResCompany(models.Model):
    _inherit = 'res.company'

    proveedor_timbrado= fields.Selection(
        selection=[('servidor', _('Principal')),
                   ('servidor2', _('Respaldo')),],
        string=_('Servidor de timbrado'), default='servidor'
    )
    api_key = fields.Char(string=_('API Key'))
    modo_prueba = fields.Boolean(string=_('Modo prueba'))
    serie_factura = fields.Char(string=_('Serie factura')) #quitar en proxima revisión
    regimen_fiscal_id  =  fields.Many2one('catalogo.regimen.fiscal', string='Régimen Fiscal')
    archivo_cer = fields.Binary(string=_('Archivo .cer'))
    archivo_key = fields.Binary(string=_('Archivo .key'))
    contrasena = fields.Char(string=_('Contraseña'))
    nombre_fiscal = fields.Char(string=_('Razón social'))
    serie_complemento = fields.Char(string=_('Serie complemento de pago')) #quitar en proxima revisión
    telefono_sms = fields.Char(string=_('Teléfono celular')) #quitar en proxima revisión
    saldo_timbres =  fields.Float(string=_('Saldo de timbres'), readonly=True)
    saldo_alarma =  fields.Float(string=_('Alarma timbres'), default=10)
    correo_alarma =  fields.Char(string=_('Correo de alarma'))
    fecha_csd = fields.Datetime(string=_('Vigencia CSD',readonly=True))
    estado_csd =  fields.Char(string=_('Estado CSD'), readonly=True)
    aviso_csd =  fields.Char(string=_('Aviso vencimiento (días antes)'), default=14)
    fecha_timbres = fields.Date(string=_('Vigencia timbres'), readonly=True)
    company_cfdi = fields.Boolean(string="CFDI MX")

    @api.onchange('country_id')
    def _get_company_cfdi(self):
        if self.country_id:
            if self.country_id.code == 'MX':
               values = {'company_cfdi': True}
            else:
               values = {'company_cfdi': False}
        else:
            values = {'company_cfdi': False}
        self.update(values)

    @api.model
    def get_saldo_by_cron(self):
        companies = self.search([('proveedor_timbrado','!=',False)])
        for company in companies:
            company.get_saldo()
            if company.saldo_timbres < company.saldo_alarma and company.correo_alarma: #valida saldo de timbres
                email_template = self.env.ref("cdfi_invoice.email_template_alarma_de_saldo",False)
                if not email_template:return
                emails = company.correo_alarma.split(",")
                for email in emails:
                    email = email.strip()
                    if email:
                        email_template.send_mail(company.id, force_send=True,email_values={'email_to':email})
            if company.aviso_csd and company.fecha_csd and company.correo_alarma: #valida vigencia de CSD
                if datetime.today() - timedelta(days=int(company.aviso_csd)) > company.fecha_csd:
                   email_template = self.env.ref("cdfi_invoice.email_template_alarma_de_csd",False)
                   if not email_template:return
                   emails = company.correo_alarma.split(",")
                   for email in emails:
                       email = email.strip()
                       if email:
                          email_template.send_mail(company.id, force_send=True,email_values={'email_to':email})
            if company.fecha_timbres and company.correo_alarma: #valida vigencia de timbres
                if (datetime.today() + timedelta(days=7)).date() > company.fecha_timbres:
                   email_template = self.env.ref("cdfi_invoice.email_template_alarma_vencimiento",False)
                   if not email_template:return
                   emails = company.correo_alarma.split(",")
                   for email in emails:
                       email = email.strip()
                       if email:
                          email_template.send_mail(company.id, force_send=True,email_values={'email_to':email})
        return True

    def get_saldo(self):
        if not self.vat:
           raise UserError(_('Falta colocar el RFC'))
        if not self.proveedor_timbrado:
           raise UserError(_('Falta seleccionar el proveedor de timbrado'))
        values = {
                 'rfc': self.vat,
                 'api_key': self.proveedor_timbrado,
                 'modo_prueba': self.modo_prueba,
                 }
        url=''
        if self.proveedor_timbrado == 'servidor':
            url = '%s' % ('https://facturacion.itadmin.com.mx/api/saldo')

        if not url:
            return
        try:
            response = requests.post(url,auth=None,data=json.dumps(values),headers={"Content-type": "application/json"})
            json_response = response.json()
        except Exception as e:
            print(e)
            json_response = {}

        if not json_response:
            return

        estado_factura = json_response['estado_saldo']
        if estado_factura == 'problemas_saldo':
            raise UserError(_(json_response['problemas_message']))
        if json_response.get('saldo'):
            xml_saldo = base64.b64decode(json_response['saldo'])
        values2 = {
                    'saldo_timbres': xml_saldo,
                    'fecha_timbres': parser.parse(json_response['vigencia']) if json_response['vigencia'] else '',
                  }
        self.update(values2)

    def validar_csd(self):
        values = {
                 'rfc': self.vat,
                 'archivo_cer': self.archivo_cer.decode("utf-8"),
                 'archivo_key': self.archivo_key.decode("utf-8"),
                 'contrasena': self.contrasena,
                 }
        url=''
        if self.proveedor_timbrado == 'servidor':
            url = '%s' % ('https://facturacion.itadmin.com.mx/api/validarcsd')
        elif self.proveedor_timbrado == 'servidor2':
            url = '%s' % ('https://facturacion2.itadmin.com.mx/api/validarcsd')
        if not url:
            return
        try:
            response = requests.post(url,auth=None,data=json.dumps(values),headers={"Content-type": "application/json"})
            json_response = response.json()
        except Exception as e:
            print(e)
            json_response = {}

        if not json_response:
            return
        #_logger.info('something ... %s', response.text)

        respuesta = json_response['respuesta']
        if json_response['respuesta'] == 'Certificados CSD correctos':
           self.fecha_csd = parser.parse(json_response['fecha'])
           values2 = {
               'fecha_csd': self.fecha_csd,
               'estado_csd': json_response['respuesta'],
               }
           self.update(values2)
        else:
           raise UserError(respuesta)

    def borrar_csd(self):
        values = {
                 'rfc': self.vat,
                 }
        url=''
        if self.proveedor_timbrado == 'servidor':
            url = '%s' % ('https://facturacion.itadmin.com.mx/api/borrarcsd')
        elif self.proveedor_timbrado == 'servidor2':
            url = '%s' % ('https://facturacion2.itadmin.com.mx/api/borrarcsd')
        if not url:
            return
        try:
            response = requests.post(url,auth=None,data=json.dumps(values),headers={"Content-type": "application/json"})
            json_response = response.json()
        except Exception as e:
            print(e)
            json_response = {}

        if not json_response:
            return
        #_logger.info('something ... %s', response.text)
        respuesta = json_response['respuesta']
        raise UserError(respuesta)

    def borrar_estado(self):
           values2 = {
               'fecha_csd': '',
               'estado_csd': '',
               }
           self.update(values2)

    def button_dummy(self):
        self.get_saldo()
        return True
