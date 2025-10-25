from odoo import _
import warnings
from odoo.exceptions import UserError, ValidationError
from odoo.http import request, Response
import json
import requests
import html2text
import datetime

class KlikApi(object):
    def __init__(self, APIUrl, klik_key, klik_secret, **kwargs):
        #APIUrl = request.env['ir.config_parameter'].sudo().get_param('aos_whatsapp.url_klikodoo_whatsapp_server')
        self.APIUrl = APIUrl or 'https://klikodoo.id/api/wa/'
        # self.APIUrl = 'https://klikodoo.id/api/wa/'
        self.klik_key = klik_key or ''
        self.klik_secret = klik_secret or ''
    
    def auth(self):
        #if not self.klik_key and not self.klik_secret:
        #    raise UserError(_('Warning! Please add Key and Secret Whatsapp API on General Settings'))
        try:
            requests.get(self.APIUrl+'status/'+self.klik_key+'/'+self.klik_secret, headers={'Content-Type': 'application/json'})
        except (requests.exceptions.HTTPError,
                requests.exceptions.RequestException,
                requests.exceptions.ConnectionError) as err:
            raise warnings.warn(_('Error! Could not connect to Whatsapp account. %s')% (err))
            # raise Warning(_('Error! Could not connect to Whatsapp account. %s')% (err))
    
    def logout(self):
        url = self.APIUrl + 'logout'
        data = {}
        data['instance'] = self.klik_key
        data['key'] = self.klik_secret
        #get_version = request.env["ir.module.module"].sudo().search([('name','=','base')], limit=1)
        #data['get_version'] = get_version and get_version.latest_version
        data_s = {
            'params' : data
        }
        req = requests.post(url, json=data_s, headers={'Content-Type': 'application/json'})
        res = json.loads(req.text)
        return res['result']
    
    # def get_qrscan(self, data):
    #     url = self.APIUrl + 'qrscan/' + self.klik_key +'/' + self.klik_secret
    #     # print ('--get_request--',url)
    #     data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
    #     res = json.loads(data_req.text)
    #     return res.get('result') and res['result'] or {}
    
    def get_count(self):
        data = {}
        url = self.APIUrl + 'count/' + self.klik_key +'/' + self.klik_secret
        data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        res = json.loads(data_req.text)
        #print ('===res===',res)
        return res.get('result') and res['result'] or {}
    
    def get_limit(self):
        data = {}
        url = self.APIUrl + 'limit/' + self.klik_key +'/' + self.klik_secret
        data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        res = json.loads(data_req.text)
        #print ('===res===',res)
        return res.get('result') and res['result'] or {}
    
    def get_number(self):
        data= {}
        url = self.APIUrl + 'check/' + self.klik_key +'/' + self.klik_secret
        data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        res = json.loads(data_req.text)
        # print ('===get_number===',res)
        return res.get('result') and res['result'] or {}
    
    def get_authenticate(self, data):
        # # url = self.APIUrl + 'get/' + self.klik_key +'/' + self.klik_secret + '/' + method
        # url = self.APIUrl + 'authentication'
        # data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        # # print ('--get_authenticate--',url,data_req,data)
        # res = json.loads(data_req.text)
        # return res.get('result') and res['result'] or {}
        try:
            #requests.get(self.APIUrl+'status/'+self.klik_key+'/'+self.klik_secret, headers={'Content-Type': 'application/json'})
            url = self.APIUrl + 'authentication'
            data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
            # print ('--get_authenticate--',url,data_req,data)
            res = json.loads(data_req.text)
            return res.get('result') and res['result'] or {}
        except (requests.exceptions.HTTPError,
                requests.exceptions.RequestException,
                requests.exceptions.ConnectionError) as err:
            raise warnings.warn(_('Error! Could not connect to Whatsapp account. %s')% (err))

    def get_qrcode(self, data):
        # url = self.APIUrl + 'get/' + self.klik_key +'/' + self.klik_secret + '/' + method
        url = self.APIUrl + '2.0/qr'
        data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        print ('==get_qrcode==',url,data,data_req)
        res = json.loads(data_req.text)
        # print ('--get_qrcode--',data_req)
        return res.get('result') and res['result'] or {}

    def get_request(self, data):
        # url = self.APIUrl + 'get/' + self.klik_key +'/' + self.klik_secret + '/' + method
        url = self.APIUrl + '2.0/get'
        data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        res = json.loads(data_req.text)
        print ('--get_request--',url,data,data_req.text)
        return res.get('result') and res['result'] or {}

    # def get_request(self, method, data):
    #     # url = self.APIUrl + 'get/' + self.klik_key +'/' + self.klik_secret + '/' + method
    #     url = self.APIUrl + 'get/' + self.klik_key +'/' + self.klik_secret + '/' + method
    #     data_req = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
    #     print ('--get_request--',url,method,data)
    #     res = json.loads(data_req.text)
    #     return res.get('result') and res['result'] or {}
    
    def post_request(self, token, data):
        url = self.APIUrl + '2.0/post'
        payload = json.dumps(data)
        # data = json.loads(data.text)
        # print ('===data_ids==',data)
        # datas = json.loads(data.text)
        # data= json.loads(data)
        # data['instance'] = self.klik_key
        # data['key'] = self.klik_secret
        # data['method'] = method
        #get_version = request.env["ir.module.module"].sudo().search([('name','=','base')], limit=1)
        #data['get_version'] = get_version and get_version.latest_version
        # payload = json.dumps({'params': data})
        # payload = {"params": {"client_secret": w.whatsapp_server_id.klik_secret}}
        # print ('====token===',token)
        response = requests.post(url, data=payload, headers={'Content-Type': 'application/json', 'Authorization': 'Bearer '+ token})
        if response.status_code == 200:
            result = json.loads(response.text)
            # print ('===message1=',url,payload,result)
            message = result.get('result').get('message')
            # chatID = message.get('id').split('_')[1] if '_' in message.get('id') else message.get('id')
            return {'chatID': 1, 'message': message}
        else:
            return {'message': {'sent': False, 'message': 'Error'}}
    
    
    def get_phone(self, method, phone):
        data = {}
        url = self.APIUrl + 'phone/' + self.klik_key + '/'+self.klik_secret +'/'+ method + '/' + phone
        data = requests.get(url, data=json.dumps(data), headers={'Content-Type': 'application/json'})
        res = json.loads(data.text)
        return res.get('result') and res['result'] or {}