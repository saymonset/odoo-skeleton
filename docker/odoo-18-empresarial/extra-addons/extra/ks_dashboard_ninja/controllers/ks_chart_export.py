import io
import json
import logging
import operator

from odoo.exceptions import ValidationError
from odoo.http import content_disposition, request
from odoo.tools import pycompat
from werkzeug.exceptions import InternalServerError

from odoo import http
from odoo.addons.web.controllers.export import ExportXlsxWriter

_logger = logging.getLogger(__name__)

class KsChartExport(http.Controller):

    def base(self, data):
        params = json.loads(data)
        if not params.get('chart_data'):
            raise ValidationError("Chart data not present")

        header,chart_data = operator.itemgetter('header','chart_data')(params)
        chart_data = json.loads(chart_data)

        if isinstance(chart_data['labels'], list):
            chart_data['labels'] = [str(label) for label in chart_data['labels']]

        chart_data['labels'].insert(0,'Measure')
        columns_headers = chart_data['labels']
        import_data = []
        excel_fields = []

        for dataset in chart_data['datasets']:
            dataset['data'].insert(0, dataset['label'])
            import_data.append(dataset['data'])


        for i in range(len(columns_headers)):
            ks_type_obj = {}
            if (len(import_data)):
                if  isinstance(import_data[0][i],float):
                    ks_type_obj['type'] = 'float'
                else:
                    ks_type_obj['type'] = ''
                excel_fields.append((ks_type_obj))


        return request.make_response(self.from_data(excel_fields,columns_headers,import_data),
            headers=[('Content-Disposition',
                            content_disposition(self.filename(header))),
                     ('Content-Type', self.content_type)],
            # cookies={'fileToken': token}
                                     )

class KsChartExcelExport(KsChartExport, http.Controller):

    # Excel needs raw data to correctly handle numbers and date values
    raw_data = True

    @http.route('/ks_dashboard_ninja/export/chart_xls', type='http', auth="user")
    def index(self, data):
        try:
            return self.base(data)
        except Exception as exc:
            _logger.exception("Exception during request handling.")
            payload = json.dumps({
                'code': 200,
                'message': "Odoo Server Error",
                'data': http.serialize_exception(exc)
            })
            raise InternalServerError(payload) from exc

    @property
    def content_type(self):
        return 'application/vnd.ms-excel'

    def filename(self, base):
        return base + '.xlsx'

    def from_data(self, fields, columns_headers, rows):
        with ExportXlsxWriter(fields, columns_headers, len(rows)) as xlsx_writer:
            for row_index, row in enumerate(rows):
                for cell_index, cell_value in enumerate(row):
                    xlsx_writer.write_cell(row_index + 1, cell_index, cell_value)

        return xlsx_writer.value


class KsChartCsvExport(KsChartExport, http.Controller):

    @http.route('/ks_dashboard_ninja/export/chart_csv', type='http', auth="user")
    def index(self, data):
        try:
            return self.base(data)
        except Exception as exc:
            _logger.exception("Exception during request handling.")
            payload = json.dumps({
                'code': 200,
                'message': "Odoo Server Error",
                'data': http.serialize_exception(exc)
            })
            raise InternalServerError(payload) from exc

    @property
    def content_type(self):
        return 'text/csv;charset=utf8'

    def filename(self, base):
        return base + '.csv'

    def from_data(self, fields,columns_headers, rows):
        fp = io.BytesIO()
        writer = pycompat.csv_writer(fp, quoting=1)

        writer.writerow(columns_headers)

        for data in rows:
            row = []
            for d in data:
                # Spreadsheet apps tend to detect formulas on leading =, + and -
                if isinstance(d, str)    and d.startswith(('=', '-', '+')):
                    d = "'" + d

                row.append(pycompat.to_text(d))
            writer.writerow(row)

        return fp.getvalue()
