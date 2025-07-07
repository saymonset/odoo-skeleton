/** @odoo-module */

import { registry } from "@web/core/registry";
import { localization } from "@web/core/l10n/localization";
import {formatDate,formatDateTime} from "@web/core/l10n/dates";
import { formatFloat,formatInteger } from "@web/views/fields/formatters";
import {parseDateTime,parseDate,} from "@web/core/l10n/dates";

const { useEffect, useRef, xml, onWillUpdateProps,Component,useState} = owl;


class KsListViewPreview extends Component{
    setup() {
        super.setup();
        const self = this;
        this.state = useState({list_view_data:""})
        this.value()
    }

    renderListViewData(item) {
        var item_list_data = item.ks_list_view_data
        var list_view_data = JSON.parse(item_list_data);
        var datetime_format = localization.dateTimeFormat;
        var date_format = localization.dateFormat;
        if (list_view_data.type === "ungrouped" && list_view_data) {
            if (list_view_data.fields_type) {
                var index_data = list_view_data.fields_type;
                for (var i = 0; i < index_data.length; i++) {
                    for (var j = 0; j < list_view_data.data_rows.length; j++) {
                        var index = index_data[i];
                        var date = list_view_data.data_rows[j]["data"][i];
                        if (date) {
                            if (index === 'date'){
                                list_view_data.data_rows[j]["data"][i] = luxon.DateTime.fromJSDate(new Date(date + " UTC")).toFormat?.(date_format);
                            }else if (index === 'datetime'){
                                list_view_data.data_rows[j]["data"][i] = luxon.DateTime.fromJSDate(new Date(date + " UTC")).toFormat?.(datetime_format);

                            }else{
//                                list_view_data.data_rows[j]["data"][i] = "";
                            }
                        }else{
//                            list_view_data.data_rows[j]["data"][i] = "";
                        }
                    }
                }
            }
        }
        return list_view_data;
    }



    value() {
        var self = this;
        var field = self.props.record.data;
        var ks_list_view_name;
        if (field.ks_list_view_data){
            var list_view_data = this.renderListViewData(field);
        }else{
            var list_view_data = false
        }
        var count = field.ks_record_count;
        if (field.name) ks_list_view_name = field.name;
        else if (field.ks_model_name) ks_list_view_name = field.ks_model_id[1];
        else ks_list_view_name = "Name";
        if (field.ks_list_view_type === "ungrouped" && list_view_data) {
            var index_data = list_view_data.date_index;
            if (index_data){
                for (var i = 0; i < index_data.length; i++) {
                    for (var j = 0; j < list_view_data.data_rows.length; j++) {
                        var index = index_data[i]
                        var date = list_view_data.data_rows[j]["data"][index]
                        if (date){
                         if( list_view_data.fields_type[index] === 'date'){
                                list_view_data.data_rows[j]["data"][index] = formatDate(parseDateTime(date), { format: localization.dateFormat })
                         } else{
                            let parsedDate = parseDateTime(date,{format: "MM-dd-yyyy HH:mm:ss"});
                            list_view_data.data_rows[j]["data"][index] = formatDateTime(parsedDate, { format: localization.dateTimeFormat })
                        }


                        }else {list_view_data.data_rows[j]["data"][index] = "";}
                    }
                }
            }
        }

        if (field.ks_list_view_data) {
            var data_rows = list_view_data.data_rows;
            if (data_rows){
                for (var i = 0; i < list_view_data.data_rows.length; i++) {
                for (var j = 0; j < list_view_data.data_rows[0]["data"].length; j++) {
                    if (typeof(list_view_data.data_rows[i].data[j]) === "number" || list_view_data.data_rows[i].data[j]) {
                        if (typeof(list_view_data.data_rows[i].data[j]) === "number") {
                           list_view_data.data_rows[i].data[j] = formatFloat(list_view_data.data_rows[i].data[j],{digits: [0, field.ks_precision_digits]})
                        }
                    } else {
                        list_view_data.data_rows[i].data[j] = "";
                    }
                }
            }
            }
        } else list_view_data = false;
        count = list_view_data && field.ks_list_view_type === "ungrouped" ? count - list_view_data.data_rows.length : false;
        count = count ? count <=0 ? false : count : false;

            this.ks_list_view_name = ks_list_view_name,
            this.state.list_view_data =  list_view_data,
            this.count = count,
            this.layout = field.ks_list_view_layout,
            this.ks_show_records = field.ks_show_records


    }

}
KsListViewPreview.template="ks_list_view";
export const KsListViewPreviewfield={
    component :KsListViewPreview,
}

registry.category("fields").add("ks_dashboard_list_view_preview", KsListViewPreviewfield);
return {
    KsListViewPreview:KsListViewPreview
}





