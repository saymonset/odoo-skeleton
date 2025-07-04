/** @odoo-module **/
import { Component, onWillStart, useState ,useEffect,onMounted, onPatched, onWillUpdateProps,useRef, onWillUnmount} from "@odoo/owl";
import { onAudioEnded } from '@ks_dashboard_ninja/js/ks_global_functions';
import { useBus, useService } from "@web/core/utils/hooks";
import { formatFloat } from "@web/core/utils/numbers";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";
import { localization } from "@web/core/l10n/localization";
import {formatDate,formatDateTime} from "@web/core/l10n/dates";
import {parseDateTime,parseDate,} from "@web/core/l10n/dates";
import { renderToElement, renderToString } from "@web/core/utils/render";
import { rpc } from "@web/core/network/rpc";

export class Ksdashboardgraph extends Component{
    setup(){
        this.chart_container = {};
        this.dialogService = useService("dialog");
        this.storeService = useService("mail.store");
        this.actionService = useService("action");
        this.state = useState({item_data:"",list_view_data:"", update_chart: 0})
        onMounted(() => this._update_view());
        onPatched(() => this.update_list_view());
        this.item = this.props.item
        this.ks_dashboard_id = this.props.item.ks_dashboard_id
        this.ks_dashboard_data = this.props.dashboard_data
        if (this.item.ks_dashboard_item_type == 'ks_list_view'){
            this.prepare_list()
        }else{
            this.prepare_item(this.item);
        }
        this.ks_gridstack_container = useRef("ks_gridstack_container");
        this.aiAudioRef = useRef("aiAudioRef");
        this.ks_list_view = useRef("ks_list_view");

        var update_interval = this.props.dashboard_data.ks_set_interval
        this.ks_ai_analysis = this.ks_dashboard_data.ks_ai_explain_dash
        if (this.item.ks_ai_analysis && this.item.ks_ai_analysis){
            var ks_analysis = this.item.ks_ai_analysis.split('ks_gap')
            this.ks_ai_analysis_1 = ks_analysis[0]
            this.ks_ai_analysis_2 = ks_analysis[1]
        }


         onWillUpdateProps(async(nextprops)=>{
            if(nextprops.ksdatefilter !='none'){
                await this.ksFetchUpdateItem(nextprops.item.id, nextprops.dashboard_data.ks_dashboard_id, nextprops.dashboard_data.context)
            }
            if (Object.keys(nextprops.pre_defined_filter).length){
                if (nextprops.pre_defined_filter?.item_ids?.includes(this.item.id)){
                    await this.ksFetchUpdateItem(this.item.id, this.ks_dashboard_id,  nextprops.dashboard_data.context)
                }
            }
             if (Object.keys(nextprops.custom_filter).length){
                if (nextprops.custom_filter?.item_ids?.includes(this.item.id)){
                    await this.ksFetchUpdateItem(this.item.id, this.ks_dashboard_id,  nextprops.dashboard_data.context)
                }
            }

        })
        useEffect(()=>{
            if (update_interval && !this.env.inDialog){
                const interval = setInterval(() => {
                    this.ksFetchUpdateItem(this.item.id, this.ks_dashboard_id, this.props.dashboard_data.context);
                }, update_interval);
                return () => clearInterval(interval);
            }

        })

        onWillUnmount( () => {
            this.aiAudioRef.el?.removeEventListener('ended', onAudioEnded)
        })

        if(this.props?.item?.ks_dashboard_item_type === 'ks_list_view' && this.env.inDialog)
            useBus(this.env.bus, `TV:List_Load_More_${this.props?.item?.id}`, (ev) => this.getDomainParams(ev));
    }

    renderListViewData(item) {
        var item_list_data = item.ks_list_view_data;
        var list_view_data = JSON.parse(item_list_data);
        var datetime_format = localization.dateTimeFormat;
        var date_format = localization.dateFormat;
        if (list_view_data.type === "ungrouped" && list_view_data) {
            if (list_view_data.date_index) {
                var index_data = list_view_data.date_index;
                for (var i = 0; i < index_data.length; i++) {
                    for (var j = 0; j < list_view_data.data_rows.length; j++) {
                        var index = index_data[i]
                        var date = list_view_data.data_rows[j]["data"][index]
                        if (date) {
                            if (list_view_data.fields_type[index] === 'date'){
                                list_view_data.data_rows[j]["data"][index] = luxon.DateTime.fromJSDate(date).format(date_format) , {}, {timezone: false};
                            }else{
                                list_view_data.data_rows[j]["data"][index] = luxon.DateTime.fromJSDate(new Date(date + " UTC")).toFormat(datetime_format), {}, {timezone: false};
                            }
                        }else{
                            list_view_data.data_rows[j]["data"][index] = "";
                        }
                    }
                }
            }
        }
        return list_view_data;
    }


    async ksFetchUpdateItem(item_id,dash_id,context,domain) {
        var self = this;
        if(!domain){
            if (this.__owl__.parent.component.hasOwnProperty('ksGetParamsForItemFetch') && this.__owl__.parent.component?.ksGetParamsForItemFetch(item_id) instanceof Function){
                domain=this.__owl__.parent.component?.ksGetParamsForItemFetch(item_id)
            }
            else{
                domain = {}
            }

        }
        await rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_item",{
            model: 'ks_dashboard_ninja.board',
            method: 'ks_fetch_item',
            args: [
                [parseInt(item_id)], dash_id,domain
            ],
            kwargs:{context},
        })
        .then(function(new_item_data) {
            if(new_item_data[item_id].ks_list_view_data){
                    new_item_data[item_id].ks_list_view_data = self.renderListViewData(new_item_data[item_id])
            }
            this.ks_dashboard_data.ks_item_data[item_id] = new_item_data[item_id];
            this.item = this.ks_dashboard_data.ks_item_data[item_id] ;
            // done this to render updated items on play button
            this.__owl__.parent.component.ks_dashboard_data.ks_item_data[this.item.id] = new_item_data[item_id]
            if (this.item.ks_dashboard_item_type =="ks_funnel_chart"){
                this.ks_gridstack_container.el?.querySelectorAll(".card-body").forEach((cardBody) => {
                    cardBody.remove();
                });
                this.ksrenderfunnelchart(this.ks_gridstack_container.el, this.item);
            }else if(this.item.ks_dashboard_item_type =="ks_list_view"){
                this.prepare_list()
                 if (this.intial_count < this.item.ks_pagination_limit ) {
                    this.ks_list_view.el?.querySelectorAll('.ks_load_next').forEach((element) => {
                        element?.classList.add('ks_event_offer_list');
                    });

                }else{
                   this.ks_list_view.el?.querySelectorAll('.ks_load_next').forEach((element) => {
                       element?.classList.remove('ks_event_offer_list');
                   });

                }

            }else if(this.item.ks_dashboard_item_type == ("ks_map_view")){
                this.ks_gridstack_container.el?.querySelectorAll(".card-body").forEach((element) => {
                    element.remove();
                });
                this.ksrendermapview(this.ks_gridstack_container.el, this.item);
            }else{
                this.ks_gridstack_container.el?.querySelectorAll(".card-body").forEach((element) => {
                    element.remove();
                });
                this.ks_render_graphs(this.ks_gridstack_container.el, this.item);

            }
        }.bind(this));
    }

    _update_view(){
        if(this.item.ks_dashboard_item_type == 'ks_list_view'){
            if (this.item.ks_pagination_limit < this.intial_count) {
            this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                element?.classList.add('ks_event_offer_list');
            });

        }
        if (this.intial_count < this.item.ks_pagination_limit ) {
              this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                element?.classList.add('ks_event_offer_list');
              });
        }
        if (this.item.ks_record_data_limit === this.item.ks_pagination_limit){
              this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                element?.classList.add('ks_event_offer_list');
              });
        }
        if (this.intial_count == 0){
             this.ks_list_view.el?.querySelectorAll('.ks_pager')?.forEach((element) => {
                element?.classList.add('d-none');
            });

        }
        if (this.item.ks_pagination_limit==0){
             this.ks_list_view.el?.querySelectorAll('.ks_pager')?.forEach((element) => {
                element?.classList.add('d-none');
            });
        }
        if (this.item.ks_data_calculation_type === 'query' || this.item.ks_list_view_type === "ungrouped"){
            document.querySelectorAll('.ks_list_canvas_click')?.forEach((element) => {
                element?.classList.remove('ks_list_canvas_click');
            });

        }
        }else{
         if (this.item.ks_data_calculation_type === 'query'){
               this.ks_gridstack_container.el?.querySelectorAll('.ks_dashboard_item_chart_info')?.forEach((element) => {
                    element?.classList.add('d-none');
               });
          }
        this.ks_gridstack_container.el?.classList.add('ks_dashboarditem_id');
        this.ks_gridstack_container.el?.querySelectorAll('.ks_dashboard_item_button_container')?.forEach((element) => {
            element?.classList.add('ks_funnel_item_container');
        });

        if (this.item.ks_dashboard_item_type =="ks_funnel_chart"){
            this.ksrenderfunnelchart(this.ks_gridstack_container.el, this.item);
        }else if(this.item.ks_dashboard_item_type == ("ks_map_view")){
            this.ksrendermapview(this.ks_gridstack_container.el, this.item);

        }else{
            this.ks_render_graphs(this.ks_gridstack_container.el, this.item);
        }
        }
    }

    update_list_view(){
        if(this.item.ks_dashboard_item_type == 'ks_list_view'){
                if (this.item.ks_pagination_limit < this.intial_count) {
               this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                    element?.classList.add('ks_event_offer_list');
               });

            }
            if (this.intial_count < this.item.ks_pagination_limit ) {
                this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                    element?.classList.add('ks_event_offer_list');
               });
            }
            if (this.item.ks_record_data_limit === this.item.ks_pagination_limit){
                this.ks_list_view.el?.querySelectorAll('.ks_load_next')?.forEach((element) => {
                    element?.classList.add('ks_event_offer_list');
                });
            }
            if (this.intial_count == 0){
                this.ks_list_view.el?.querySelectorAll('.ks_pager')?.forEach((element) => {
                    element?.classList.add('d-none');
                });
            }
            if (this.intial_count != 0){
                 this.ks_list_view.el?.querySelectorAll('.ks_pager')?.forEach((element) => {
                    element?.classList.remove('d-none');
                });
            }
            if (this.item.ks_pagination_limit==0){
                this.ks_list_view.el?.querySelectorAll('.ks_pager_name')?.forEach((element) => {
                    element?.classList.add('d-none');
                });
            }
            if (this.item.ks_data_calculation_type === 'query' || this.item.ks_list_view_type === "ungrouped"){
               document.querySelectorAll('.ks_list_canvas_click')?.forEach((element) => {
                    element?.classList.remove('ks_list_canvas_click');
               });

            }
        }
    }

    prepare_list() {
        var self = this;
        if (this.item.ks_info){
            var ks_description = this.item.ks_info.split('\n');
            var ks_description = ks_description.filter(element => element !== '')
        }else {
            var ks_description = false;
        }
        if (typeof(this.item.ks_list_view_data) == 'string'){
            var list_view_data = JSON.parse(this.item.ks_list_view_data)
        }else{
             var list_view_data = this.item.ks_list_view_data
        }
        var data_rows = list_view_data.data_rows
        var length = data_rows ? data_rows.length: false;
        var item_id = this.item.id
        this.ks_info = ks_description;
        this.ks_chart_title = this.item.name
        this.ks_breadcrumb = this.item.ks_action_name
        this.item_id = item_id
        this.ksIsDashboardManager= self.ks_dashboard_data.ks_dashboard_manager,
        this.ksIsUser = true,
        this.ks_dashboard_list = self.ks_dashboard_data.ks_dashboard_list,
        this.count = '1-' + length
        this.offset = 1
        this.intial_count = length
        this.ks_company= this.item.ks_company
        this.calculation_type = this.ks_dashboard_data.ks_item_data[this.item_id].ks_data_calculation_type
        this.self = this

        if (this.item.ks_list_view_type === "ungrouped" && list_view_data) {
            if (list_view_data.date_index) {
                var index_data = list_view_data.date_index;
                for (var i = 0; i < index_data.length; i++) {
                    for (var j = 0; j < list_view_data.data_rows.length; j++) {
                        var index = index_data[i]
                        var date = list_view_data.data_rows[j]["data"][index]
                        if (date) {
                            if( list_view_data.fields_type[index] === 'date'){
                                let parsedDate = parseDate(date,{format: localization.dateFormat});
                                list_view_data.data_rows[j]["data"][index] = formatDate(parsedDate, { format: localization.dateFormat })
                            } else{
                                let parsedDate = parseDateTime(date,{format: localization.dateTimeFormat});
                                list_view_data.data_rows[j]["data"][index] = formatDateTime(parsedDate, { format: localization.dateTimeFormat })
                            }
                        }else{
                            list_view_data.data_rows[j]["data"][index] = "";
                        }
                    }
                }
            }
        }
        if (list_view_data) {
            for (var i = 0; i < list_view_data.data_rows.length; i++) {
                for (var j = 0; j < list_view_data.data_rows[0]["data"].length; j++) {
                    if (typeof(list_view_data.data_rows[i].data[j]) === "number" || list_view_data.data_rows[i].data[j]) {
                        if (typeof(list_view_data.data_rows[i].data[j]) === "number") {
                            list_view_data.data_rows[i].data[j] = formatFloat(list_view_data.data_rows[i].data[j], Float64Array, {digits:[0, self.item.ks_precision_digits]})
                        }
                    } else {
                        list_view_data.data_rows[i].data[j] = "";
                    }
                }
            }
        }
        this.state.list_view_data = list_view_data
        this.list_type = this.item.ks_list_view_type
        this.ks_pager = true
        this.tmpl_list_type = self.ks_dashboard_data.ks_item_data[this.item_id].ks_list_view_type
        this.isDrill = this.ks_dashboard_data.ks_item_data[this.item_id]['isDrill']
        this.ks_show_records = this.item.ks_show_records
    }

    prepare_item(item) {
     var self = this;
     var isDrill = item.isDrill ? item.isDrill : false;
     this.chart
     var chart_id = item.id;
     this.ksColorOptions = ["default","dark","moonrise","material"]
     var funnel_title = item.name;
     if (item.ks_info){
        var ks_description = item.ks_info.split('\n');
        var ks_description = ks_description.filter(element => element !== '')
     }else {
        var ks_description = false;
     }

     this.ks_chart_title= funnel_title,
     this.ksIsDashboardManager= self.ks_dashboard_data.ks_dashboard_manager,
     this.ksIsUser = true,
     this.ks_dashboard_list = self.ks_dashboard_data.ks_dashboard_list,
     this.chart_id = chart_id,
     this.ks_info = ks_description,
     this.ksChartColorOptions = this.ksColorOptions,
     this.ks_company = item.ks_company,
     this.ks_dashboard_item_type = item.ks_dashboard_item_type,
     this.ks_breadcrumb = item.ks_action_name
    }

    ks_render_graphs(ks_gridstack_container,item, zooming_enabled = false){
        var self =this;
        var chartCardBodies = ks_gridstack_container?.querySelectorAll('.ks_chart_card_body');
         if (chartCardBodies?.length > 0) {
            var graph_render = chartCardBodies;
        } else {
            var newCardBody = document.createElement('div');
            newCardBody.className = 'card-body ks_chart_card_body';
            var dashboardItemContainer = ks_gridstack_container?.querySelector('.ks_dashboarditem_chart_container');
            if (dashboardItemContainer) {
                dashboardItemContainer.appendChild(newCardBody);
            }
            var graph_render = ks_gridstack_container?.querySelectorAll('.ks_chart_card_body');
        }
        const chart_data = JSON.parse(item.ks_chart_data);
        var ks_labels = chart_data['labels'];
        var ks_data = chart_data.datasets;
        if(item.ks_chart_cumulative_field){
            for(var i=0;i<ks_data?.length;i++){
                var ks_temp_com = 0;
                var datasets = {};
                var cumulative_data = []
                if(ks_data[i].ks_chart_cumulative_field){
                    for(var j=0; j< ks_data[i].data.length; j++){
                        ks_temp_com = ks_temp_com + ks_data[i].data[j];
                        cumulative_data.push(ks_temp_com);
                    }
                    datasets.label = 'Cumulative ' + ks_data[i].label;
                    datasets.data = cumulative_data;
                    if(item.ks_chart_cumulative){
                        datasets.type = 'line';
                    }
                    ks_data.push(datasets);
                }
            }
        }

        if(item.ks_chart_cumulative_field){
            for(var i=0;i<ks_data?.length;i++){
                var ks_temp_com = 0;
                var datasets = {};
                var cumulative_data = []
                if(ks_data[i].ks_chart_cumulative_field){
                    for(var j=0; j< ks_data[i].data?.length; j++){
                        ks_temp_com = ks_temp_com + ks_data[i].data[j];
                        cumulative_data.push(ks_temp_com);
                    }
                    datasets.label = 'Cumulative ' + ks_data[i].label;
                    datasets.data = cumulative_data;
                    if(item.ks_chart_cumulative){
                        datasets.type = 'line';
                    }
                    ks_data.push(datasets);
                }
            }
        }


        let data=[];
        if (ks_data && ks_labels){
        if (ks_data.length && ks_labels.length){
            for (let i=0 ; i<ks_labels.length ; i++){
                let data2={};
                for (let j=0 ;j<ks_data.length ; j++){
                    if (ks_data[j].type == "line"){
                    data2[ks_data[j].label] = ks_data[j].data[i]
                    }else{
                    data2[ks_data[j].label] = ks_data[j].data[i]
                    }
                }
                data2["category"] = ks_labels[i]
                data.push(data2)
            }

            if(graph_render){
                var root  = am5.Root.new(graph_render[0]);
            }

            const theme = item.ks_chart_item_color

            switch(theme){
            case "default":
                root?.setThemes([am5themes_Animated.new(root)]);
                break;
            case "dark":
                root?.setThemes([am5themes_Dataviz.new(root)]);
                break;
            case "material":
                root?.setThemes([am5themes_Material.new(root)]);
                break;
            case "moonrise":
                root?.setThemes([am5themes_Moonrise.new(root)]);
                break;
            };
            var chart_type = item.ks_dashboard_item_type
            switch (chart_type){
            case "ks_bar_chart":
            case "ks_bullet_chart":
                if(this.props?.dashboard_data?.zooming_enabled || zooming_enabled){
                    var wheely_val = "zoomX";
                }else{
                    var wheely_val = 'none';
                }
            var chart = root.container.children.push(am5xy.XYChart.new(root, {panX: false,panY: false,
             wheelX: "panX",wheelY: wheely_val,layout: root.verticalLayout}));

            var xRenderer = am5xy.AxisRendererX.new(root, {
                   minGridDistance: 15,
                   minorGridEnabled: true
            });

            if (chart_type=='ks_bar_chart'){
            var rotations_angle = -45
            }
            else{
            rotations_angle = -90
            }

            xRenderer.labels.template.setAll({
              direction: "rtl",
              rotation: rotations_angle,
              centerY: am5.p50,
              centerX: am5.p100,
              paddingRight: 10
            });

            var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {categoryField: "category",
            renderer: xRenderer,tooltip: am5.Tooltip.new(root, {})}));

            xRenderer.grid.template.setAll({location: 1})

            xAxis.data.setAll(data);

            var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {extraMin: 0,
            extraMax: 0.1,renderer: am5xy.AxisRendererY.new(root, {strokeOpacity: 0.1}) }));

            // Add series

            for (let k = 0;k<ks_data.length ; k++){
                if (item.ks_dashboard_item_type == "ks_bar_chart" && item.ks_bar_chart_stacked == true && ks_data[k].type != "line"){
                    var tooltip = am5.Tooltip.new(root, {
                        pointerOrientation: "horizontal",
                        textAlign: "center",
                        centerX: am5.percent(96),
                        labelText: "{categoryX}, {name}: {valueY}"
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        stacked: true,
                        name: `${ks_data[k].label}`,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField:`${ks_data[k].label}`,
                        categoryXField: "category",
                        tooltip: tooltip
                    }));
                    series.columns.template.events.on("click",function(ev){
                        if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                            self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                        }
                    });
                    series.data.setAll(data);
                }else if (item.ks_dashboard_item_type == "ks_bar_chart" && ks_data[k].type != "line"){
                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        pointerOrientation: "horizontal",
                        labelText: "{categoryX}, {name}: {valueY}"
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        name: `${ks_data[k].label}`,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField:`${ks_data[k].label}`,
                        categoryXField: "category",
                        tooltip: tooltip

                    }));
                    series.columns.template.events.on("click",function(ev){
                        if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                            self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                        }
                    });
                    series.data.setAll(data);

                }else if (item.ks_dashboard_item_type == "ks_bullet_chart"){
                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        labelText: `${ks_data[k].label}: {valueY}`
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                    name: `${ks_data[k].label}`,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField:`${ks_data[k].label}`,
                    categoryXField: "category",
                    clustered: false,
                    tooltip: tooltip
                    }));

                    series.columns.template.setAll({
                        width: am5.percent(80-(10*k)),
                        tooltipY: 0,
                        strokeOpacity: 0
                    });
                    series.columns.template.events.on("click",function(ev){
                        if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                            self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                        }
                    });
                    series.data.setAll(data);
                }

                if (item.ks_show_records == true && series){
                    series.columns.template.setAll({
                        tooltipY: 0,
                        templateField: "columnSettings"
                   });
                    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                            behavior: "zoomY"
                    }));
                   cursor.lineY.set("forceHidden", true);
                   cursor.lineX.set("forceHidden", true);
                }
                if (item.ks_show_data_value == true && series){
                    series.bullets.push(function () {
                        return am5.Bullet.new(root, {
//                            locationY:1,
                                sprite: am5.Label.new(root, {
                                  text:  "{valueY}",
                                  centerY: am5.p100,
                                  centerX: am5.p50,
                                  populateText: true
                                })
                        });
                    });
                }
                if (item.ks_dashboard_item_type == "ks_bar_chart" && item.ks_chart_measure_field_2 && ks_data[k].type == "line"){
                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        pointerOrientation: "horizontal",
                        labelText: "{categoryX}, {name}: {valueY}"
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    var series2 = chart.series.push(
                        am5xy.LineSeries.new(root, {
                            name: `${ks_data[k].label}`,
                            xAxis: xAxis,
                            yAxis: yAxis,
                            valueYField:`${ks_data[k].label}`,
                            categoryXField: "category",
                            tooltip: tooltip
                        })
                    );

                    series2.strokes.template.setAll({strokeWidth: 3,templateField: "strokeSettings"});
                    series2.strokes.template.events.on("click",function(ev){
                        if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                            self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                        }
                    });
                    series2.data.setAll(data);

                    series2.bullets.push(function() {
                        return am5.Bullet.new(root, {
                            sprite: am5.Circle.new(root, {
                                strokeWidth: 3,
                                stroke: series2.get("stroke"),
                                radius: 5,
                                fill: root.interfaceColors.get("background")
                            })
                        });
                    });
                }
            }
            break;
            case "ks_horizontalBar_chart":
                if(this.props?.dashboard_data?.zooming_enabled || zooming_enabled){
                    var wheely_val = "zoomX";
                }else{
                    var wheely_val = 'none';
                }
                var chart = root.container.children.push(am5xy.XYChart.new(root, {panX: false,panY: false,
                wheelX: "panX",wheelY: wheely_val,layout: root.verticalLayout}));
                var yRenderer = am5xy.AxisRendererY.new(root, {
                        inversed: true,
                        minGridDistance: 30,
                        minorGridEnabled: true,
                        cellStartLocation: 0.1,
                        cellEndLocation: 0.9
                    })
                yRenderer.labels.template.setAll({
                  direction: "rtl",
                });
                var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
                    categoryField: "category",
                    renderer: yRenderer
                }))

                yAxis.data.setAll(data);

                var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
                    renderer: am5xy.AxisRendererX.new(root, {
                        strokeOpacity: 0.1
                    }),
                    min: 0
                }));
                for (let k = 0;k<ks_data.length ; k++){
                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        pointerOrientation: "horizontal",
                        labelText: "{categoryY}, {name}: {valueX}"
                    });

                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                if (item.ks_bar_chart_stacked == true){
                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        stacked: true,
                        name: `${ks_data[k].label}`,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueXField:`${ks_data[k].label}`,
                        categoryYField: "category",
                        sequencedInterpolation: true,
                        tooltip: tooltip
                    }));

                }else if (item.ks_dashboard_item_type == "ks_horizontalBar_chart" && ks_data[k].type != "line"){
                    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                        name: `${ks_data[k].label}`,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueXField:`${ks_data[k].label}`,
                        categoryYField: "category",
                        sequencedInterpolation: true,
                        tooltip: tooltip

                }));
                }
                    if (item.ks_show_records == true && series){
                        series.columns.template.setAll({
    //                        width: am5.percent(80-(10*k)),
                            height: am5.p100,
                            strokeOpacity: 0
                       });
                       var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                                behavior: "zoomY"
                        }));
                       cursor.lineY.set("forceHidden", true);
                       cursor.lineX.set("forceHidden", true);
                    }
                    if (item.ks_show_data_value == true && series){
                        series.bullets.push(function () {
                            return am5.Bullet.new(root, {
    //                            locationX: 1,
                                    sprite: am5.Label.new(root, {
                                      text:  "{valueX}",
                                      centerY: am5.p50,
                                      centerX: am5.p50,
                                      populateText: true
                                    })
                            });
                        });
                    }
                    if (series){
                        series.columns.template.events.on("click",function(ev){
                            if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                            }
                        });

                        series.data.setAll(data);
                    }

                 if (item.ks_dashboard_item_type == "ks_horizontalBar_chart" && ks_data[k].type == "line"){
                    var series2 = chart.series.push(
                        am5xy.LineSeries.new(root, {
                            name: `${ks_data[k].label}`,
                            xAxis: xAxis,
                            yAxis: yAxis,
                            valueXField:`${ks_data[k].label}`,
                            categoryYField: "category",
                            sequencedInterpolation: true,
                            tooltip: am5.Tooltip.new(root, {
                                pointerOrientation: "horizontal",
                                labelText: "{categoryY}, {name}: {valueX}"
                            })
                        })
                    );

                    series2.strokes.template.setAll({strokeWidth: 3,templateField: "strokeSettings"});
                    series2.strokes.template.events.on("click",function(ev){
                        if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                            self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                        }
                    });


                    series2.bullets.push(function() {
                        return am5.Bullet.new(root, {
                            sprite: am5.Circle.new(root, {
                                strokeWidth: 3,
                                stroke: series2.get("stroke"),
                                radius: 5,
                                fill: root.interfaceColors.get("background")
                            })
                        });
                    });
                     series2.data.setAll(data);

                }
            }
            break;
            case "ks_line_chart":
            case "ks_area_chart":
                if(this.props.dashboard_data.zooming_enabled || zooming_enabled){
                    var wheely_val = "zoomX";
                }else{
                    var wheely_val = 'none';
                }

                var chart = root.container.children.push(am5xy.XYChart.new(root, {panX: false,panY: false,
                wheelX: "panX",wheelY: wheely_val,layout: root.verticalLayout}));
                var xRenderer = am5xy.AxisRendererX.new(root, {
                    minGridDistance: 15,
                    minorGridEnabled: true
                    });
                xRenderer.labels.template.setAll({
                  direction: "rtl",
                  rotation: -45,
                  centerY: am5.p50,
                  centerX: am5.p100,
                  paddingRight: 10
                });
                var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
                    categoryField: "category",
                    maxDeviation: 0.2,
                    renderer: xRenderer,
                    tooltip: am5.Tooltip.new(root, {})
                }));
                xAxis.data.setAll(data);

                var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {extraMin: 0,
                extraMax: 0.1,renderer: am5xy.AxisRendererY.new(root, {strokeOpacity: 0.1}) }));

                for (let k = 0;k<ks_data.length ; k++){

                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        labelText: "[bold]{categoryX}[/]\n{name}: {valueY}"
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    var series = chart.series.push(am5xy.LineSeries.new(root, {
                        name: `${ks_data[k].label}`,
                        xAxis: xAxis,
                        yAxis: yAxis,
                        valueYField: `${ks_data[k].label}`,
                        categoryXField: "category",
                        alignLabels: true,
                        tooltip: tooltip
                    }));
                    series.strokes.template.setAll({strokeWidth: 2,templateField: "strokeSettings"});

                    series.bullets.push(function() {
                        var graphics = am5.Rectangle.new(root, {
                            width:7,
                            height:7,
                            centerX:am5.p50,
                            centerY:am5.p50,
                            fill: series.get("stroke")
                        });
                        if (item.ks_dashboard_item_type == "ks_area_chart" || item.ks_dashboard_item_type == "ks_line_chart"){
                            graphics.events.on("click", function(ev) {
                                if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                    self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                }
                            });
                        }
                        return am5.Bullet.new(root, {
                            sprite: graphics
                        });
                    });
                    if (item.ks_show_data_value == true && series){
                        series.bullets.push(function () {
                            return am5.Bullet.new(root, {
                                sprite: am5.Label.new(root, {
                                    text:  "{valueY}",
                                    centerX:am5.p50,
                                    centerY:am5.p100,
                                    populateText: true
                                 })
                            });
                        });
                    }
                    if (item.ks_dashboard_item_type === "ks_area_chart"){
                        series.fills.template.setAll({
                            fillOpacity: 0.5,
                            visible: true
                        });
                    }

                    series.data.setAll(data);
                }

                if (item.ks_show_records == true){
                    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                        behavior: "none"
                    }));
                    cursor.lineY.set("forceHidden", true);
                    cursor.lineX.set("forceHidden", true);

                }
                break;
                case "ks_pie_chart":
                case "ks_doughnut_chart":
                    var series = []
                    if (item.ks_semi_circle_chart == true && (item.ks_dashboard_item_type == "ks_pie_chart" ||item.ks_dashboard_item_type == "ks_doughnut_chart")){
                         if (item.ks_dashboard_item_type == 'ks_doughnut_chart'){
                            var chart = root.container.children.push(
                                am5percent.PieChart.new(root, {
                                   innerRadius : am5.percent(50),
                                   layout: root.verticalLayout,
                                   startAngle: 180,
                                   endAngle: 360,
                            }));
                        }else{
                            var chart = root.container.children.push(
                                am5percent.PieChart.new(root, {
                                    radius: am5.percent(90),
                                    layout: root.verticalLayout,
                                    startAngle: 180,
                                    endAngle: 360,
                                }));
                        }
                        var legend = chart.children.push(am5.Legend.new(root, {
                          centerX: am5.percent(50),
                          x: am5.percent(50),
                          layout: am5.GridLayout.new(root, {
                            maxColumns: 3,
                            fixedWidthGrid: true
                          })
                        }));
                        for (let k = 0;k<ks_data.length ; k++){
                            series[k] = chart.series.push(
                                am5percent.PieSeries.new(root, {
                                name: `${ks_data[k].label}`,
                                valueField: `${ks_data[k].label}`,
                                categoryField: "category",
                                alignLabels: false,
                                startAngle: 180,
                                endAngle: 360,
                            }));
                        }
                    }else{
                        if (item.ks_dashboard_item_type == "ks_doughnut_chart"){
                            var chart = root.container.children.push(
                                am5percent.PieChart.new(root, {
                                innerRadius: am5.percent(50),
                                layout: root.verticalLayout,
                            }));
                        }else{
                            var chart = root.container.children.push(
                                am5percent.PieChart.new(root, {
                                radius: am5.percent(90),
                                layout: root.verticalLayout,
                            }));
                        }

                       var legend = chart.children.push(am5.Legend.new(root, {
                          centerX: am5.percent(50),
                          x: am5.percent(50),
                          layout: am5.GridLayout.new(root, {
                            maxColumns: 3,
                            fixedWidthGrid: true
                          }),
//                          reverseChildren: true
                        }));

                        for (let k = 0;k<ks_data.length ; k++){
                            series[k] = chart.series.push(
                                am5percent.PieSeries.new(root, {
                                name: `${ks_data[k].label}`,
                                valueField: `${ks_data[k].label}`,
                                categoryField: "category",
                                alignLabels: false,
                            })
                            );
                        }
                    }
                    var bgColor = root.interfaceColors.get("background");
                    for (let rec of series){
                        rec.ticks.template.setAll({ forceHidden: true })
                        rec.slices.template.setAll({
                            stroke: bgColor,
                            strokeWidth: 2,
                            templateField: "settings",
                            });
                            rec.slices.template.events.on("click", function(ev) {
                                rec.slices.each(function(slice) {
                                    if(slice == ev.target && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard'] && item.ks_data_calculation_type === 'custom'){
                                        self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                    }
                                })
                            });

                        if (item.ks_show_records == true){
                            var tooltip = am5.Tooltip.new(root, {
                                textAlign: "center",
                                centerX: am5.percent(96)
                            });
                            tooltip.label.setAll({
                                direction: "rtl"
                            })
                            rec.slices.template.setAll({
                                tooltipText: "[bold]{category}[/]\n{name}: {value}",
                                tooltip: tooltip
                            });
                        }
                        if (item.ks_show_data_value == true){
                            rec.labels.template.setAll({
                                text: item.ks_data_label_type == 'value'? "{value}":("{valuePercentTotal}%") ,
                                inside: true,
                                textType: data?.length>10? "radial" : "circular",
                                centerX: am5.percent(80)
                            })
                        }
                        else{
                            rec.labels.template.setAll({forceHidden:true})
                        }
                        rec.data.setAll(data)
                         if(item.ks_hide_legend == true && series){
                            legend.data.setAll(rec.dataItems);
                         }

                        rec.appear(1000, 100);
                    }
                    break;
                case "ks_polarArea_chart":
                case "ks_radar_view":
                case "ks_flower_view":
                case "ks_radialBar_chart":
                    if(this.props?.dashboard_data?.zooming_enabled || zooming_enabled){
                        var wheely_val = "zoomX";
                    }else{
                        var wheely_val = 'none';
                    }
                    var chart = root.container.children.push(am5radar.RadarChart.new(root, {
                        panX: false,
                        panY: false,
                        wheelX: "panX",
                        wheelY: wheely_val,
                        radius: am5.percent(80),
//                        layout: root.verticalLayout,
                    }));

                    if (item.ks_dashboard_item_type == "ks_flower_view"){
                        var xRenderer = am5radar.AxisRendererCircular.new(root, {});
                        xRenderer.labels.template.setAll({
                            radius: 10,
                            cellStartLocation: 0.2,
                            cellEndLocation: 0.8
                        });
                    }else if (item.ks_dashboard_item_type == "ks_radialBar_chart"){
                        var xRenderer = am5radar.AxisRendererCircular.new(root, {
                            strokeOpacity: 0.1,
                            minGridDistance: 50
                         });
                        xRenderer.labels.template.setAll({
                            radius: 23,
                            maxPosition: 0.98
                        });
                    }else{
                        var xRenderer = am5radar.AxisRendererCircular.new(root, {});
                        xRenderer.labels.template.setAll({
                            radius: 10,
                        });
                    }
                    if (item.ks_dashboard_item_type == "ks_radialBar_chart"){
                        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
                            renderer: xRenderer,
                            extraMax: 0.1,
                            tooltip: am5.Tooltip.new(root, {})
                        }));

                        var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
                            categoryField: "category",
                            renderer: am5radar.AxisRendererRadial.new(root, { minGridDistance: 20 })
                        }));
                        yAxis.get("renderer").labels.template.setAll({
                            oversizedBehavior: "truncate",
                            textAlign: "center",
                            maxWidth: 150,
                            ellipsis: "..."
                        });
                    }else{
                        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
                            maxDeviation: 0,
                            categoryField: "category",
                            renderer: xRenderer,
                            tooltip: am5.Tooltip.new(root, {})
                        }));
                        xAxis.data.setAll(data);

                        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                            renderer: am5radar.AxisRendererRadial.new(root, {})
                        }));
                    }
                    if (item.ks_dashboard_item_type == "ks_polarArea_chart"){
                        for (let k = 0;k<ks_data.length ; k++) {
                            var series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
                            stacked: true,
                            name: `${ks_data[k].label}`,
                            xAxis: xAxis,
                            yAxis: yAxis,
                            valueYField: `${ks_data[k].label}`,
                            categoryXField: "category",
                            alignLabels: true,
                            }));

                        series.set("stroke", root.interfaceColors.get("background"));
                        if (item.ks_show_records == true){
                            var tooltip = am5.Tooltip.new(root, {
                                textAlign: "center",
                                centerX: am5.percent(96)
                            });
                            tooltip.label.setAll({
                                direction: "rtl"
                            })
                            series.columns.template.setAll({
                                width: am5.p100,
                                strokeOpacity: 0.1,
                                tooltipText: "{name}: {valueY}",
                                tooltip: tooltip
                            });
                        }
                        series.columns.template.events.on("click",function(ev){
                            if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                            }
                        });
                        series.data.setAll(data);
                        }
                        xAxis.data.setAll(data);
                    }else if (item.ks_dashboard_item_type == "ks_flower_view"){
                        for (let k = 0;k<ks_data.length ; k++){
                            var series = chart.series.push(
                                am5radar.RadarColumnSeries.new(root, {
                                name: `${ks_data[k].label}`,
                                xAxis: xAxis,
                                yAxis: yAxis,
                                valueYField: `${ks_data[k].label}`,
                                categoryXField: "category"
                             })
                            );

                            var tooltip = am5.Tooltip.new(root, {
                                textAlign: "center",
                                centerX: am5.percent(96)
                            });
                            tooltip.label.setAll({
                                direction: "rtl"
                            })

                            series.columns.template.setAll({
                                tooltip: tooltip,
                                tooltipText: "{name}: {valueY}",
                                width: am5.percent(100)
                            });
                            series.columns.template.events.on("click",function(ev){
                                if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                    self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                }
                            });
                            series.data.setAll(data);
                        }

                    }else if (item.ks_dashboard_item_type == "ks_radialBar_chart"){
                        for (let k = 0;k<ks_data.length ; k++) {
                            var series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
                                stacked: true,
                                name: `${ks_data[k].label}`,
                                xAxis: xAxis,
                                yAxis: yAxis,
                                valueXField: `${ks_data[k].label}`,
                                categoryYField: "category"
                            }));

                            series.set("stroke",root.interfaceColors.get("background"));
                            var tooltip = am5.Tooltip.new(root, {
                                textAlign: "center",
                                centerX: am5.percent(96)
                            });
                            tooltip.label.setAll({
                                direction: "rtl"
                            })

                            series.columns.template.setAll({
                                width: am5.p100,
                                strokeOpacity: 0.1,
                                tooltipText: "{name}: {valueX}  {category}",
                                tooltip: tooltip
                            });
                            series.columns.template.events.on("click",function(ev){
                                if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                    self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                }
                            });
                            series.data.setAll(data);
                        }
                        yAxis.data.setAll(data);
                   }else{
                        for (let k = 0;k<ks_data.length ; k++){
                            var tooltip = am5.Tooltip.new(root, {
                                textAlign: "center",
                                centerX: am5.percent(96),
                                labelText: "{valueY}"
                            });
                            tooltip.label.setAll({
                                direction: "rtl"
                            })
                            var series = chart.series.push(am5radar.RadarLineSeries.new(root, {
                                name:`${ks_data[k].label}`,
                                xAxis: xAxis,
                                yAxis: yAxis,
                                valueYField: `${ks_data[k].label}`,
                                categoryXField: "category",
                                alignLabels: true,
                                tooltip: tooltip
                            }));

                            series.strokes.template.setAll({
                            strokeWidth: 2,

                            });
                        series.bullets.push(function() {
                            var graphics = am5.Circle.new(root, {
                                fill: series.get("fill"),
                                radius: 5
                            });
                            graphics.events.on("click", function(ev) {
                                if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                    self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                }
                            });
                            return am5.Bullet.new(root, {
                                sprite: graphics
                            });
                        });
                        series.data.setAll(data);
                    }
                        xAxis.data.setAll(data);
                   }

                    break;

                case "ks_scatter_chart":
                if(this.props?.dashboard_data?.zooming_enabled || zooming_enabled){
                        var wheely_val = "zoomX";
                    }else{
                        var wheely_val = 'none';
                    }
                var chart = root.container.children.push(am5xy.XYChart.new(root, {panX: false,panY: false,
                 wheelX: "panX",wheelY: wheely_val,layout: root.verticalLayout}));
                    var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
                        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
                        tooltip: am5.Tooltip.new(root, {})
                    }));
                    xAxis.ghostLabel.set("forceHidden", true);

                    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                        renderer: am5xy.AxisRendererY.new(root, {}),
                        tooltip: am5.Tooltip.new(root, {})
                    }));
                    yAxis.ghostLabel.set("forceHidden", true);

                    var tooltip = am5.Tooltip.new(root, {
                        textAlign: "center",
                        centerX: am5.percent(96),
                        labelText: "{name_1}:{valueX} {name}:{valueY}"
                    });
                    tooltip.label.setAll({
                        direction: "rtl"
                    })

                    for (let k = 0;k<ks_data.length ; k++){
                        var series = chart.series.push(am5xy.LineSeries.new(root, {
                            name:`${ks_data[k].label}`,
                            name_1 : chart_data.groupby,
                            calculateAggregates: true,
                            xAxis: xAxis,
                            yAxis: yAxis,
                            valueYField: `${ks_data[k].label}`,
                            valueXField: "category",
                            tooltip: tooltip
                        }));

                        series.bullets.push(function() {
                            var graphics = am5.Triangle.new(root, {
                                fill: series.get("fill"),
                                width: 10,
                                height: 7
                            });
                            graphics.events.on("click", function(ev) {
                                if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                    self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                                }
                            });
                            return am5.Bullet.new(root, {
                                sprite: graphics
                            });
                        });
                         var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                            behavior: "none",
                            snapToSeries: [series]
                            }));
                            cursor.lineY.set("forceHidden", true);
                            cursor.lineX.set("forceHidden", true);
                        series.strokes.template.set("strokeOpacity", 0);
                        series.data.setAll(data);

                    }
                    break;
            }
            if(chart_type == 'ks_radar_view'||chart_type == 'ks_radialBar_chart'||chart_type == 'ks_flower_view'||chart_type == 'ks_polarArea_chart'){
                   root.rtl=true;
                   var legend = chart.children.push(
                   am5.Legend.new(root, {
                          layout: root.horizontalLayout,
                          centerX: am5.percent(100),
                           x: am5.percent(100),

                    })
                );
                  legend.labels.template.setAll({
                    textAlign: "right"
                });
                legend.itemContainers.template.setAll({
                      reverseChildren: true
                    });
            }
                else {
                    root.rtl=true;
                    var legend = chart.children.push(
                    am5.Legend.new(root, {
                        centerX: am5.p50,
                        x: am5.p50,
                        layout: root.gridLayout,
                        y: am5.percent(100),
                        centerY: am5.percent(100),
                    })
                );

                legend.labels.template.setAll({
                  textAlign: "right",
                  marginRight:5
                });
                legend.itemContainers.template.setAll({
                      reverseChildren: true
                    });
                }
                if(item.ks_hide_legend == true && series && chart_type !='ks_pie_chart' && chart_type != 'ks_doughnut_chart'){
                    legend.data.setAll(chart.series.values);
                }


            if (item.ks_data_format && item.ks_data_format == 'global'){
                root.numberFormatter.setAll({
                    numberFormat: "#.0a",
                    bigNumberPrefixes: [{"number":1e+3,"suffix":"k"},{ "number": 1e+6, "suffix": "M" },
                    { "number": 1e+9, "suffix": "G" },{ "number": 1e+12, "suffix": "T" },
                    { "number": 1e+15, "suffix": "P" },{ "number": 1e+18, "suffix": "E" }]
                });
            }else if (item.ks_data_format && item.ks_data_format == 'indian'){
                root.numberFormatter.setAll({
                    numberFormat: "#.0a",
                    bigNumberPrefixes: [{"number":1e+3,"suffix":"Th"},{"number":1e+5,"suffix":"Lakh"},
                    { "number": 1e+7, "suffix": "Cr" },{ "number": 1e+9, "suffix": "Arab" }],
                });
            }else if (item.ks_data_format && item.ks_data_format == 'colombian'){
                root.numberFormatter.setAll({
                    numberFormat: "#.a",
                    bigNumberPrefixes: [{"number":1e+6,"suffix":"M"},{ "number": 1e+9, "suffix": "M" },{ "number": 1e+12, "suffix": "M" },
                    { "number": 1e+15, "suffix": "M" },{ "number": 1e+18, "suffix": "M" }]
                });
            }else{
                root.numberFormatter.setAll({
                    numberFormat: "#"
                });
            }
            chart.appear(1000, 100);

            if (item.ks_dashboard_item_type != 'ks_pie_chart' &&  item.ks_dashboard_item_type != 'ks_doughnut_chart' && series){
                series.appear();
            }
            ks_gridstack_container.querySelector('.ks_li_' + item.ks_chart_item_color)?.classList.add('ks_date_filter_selected');
        }else{
             var ksChartCardBody = ks_gridstack_container?.querySelector('.ks_chart_card_body');
             if(ksChartCardBody) {
                ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
             }
        }
        }else{
            var ksChartCardBody = ks_gridstack_container?.querySelector('.ks_chart_card_body');
            if(ksChartCardBody) {
                ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
            }

        }
    }

     ksrenderfunnelchart(ks_gridstack_container,item){
            var self =this;
            if(ks_gridstack_container?.querySelectorAll('.ks_chart_card_body')?.length){
                var funnelRender = ks_gridstack_container?.querySelectorAll('.ks_chart_card_body');
            }else{
                var dashboardItemContainer = ks_gridstack_container?.querySelector('.ks_dashboarditem_chart_container');
                var newCardBody = document.createElement('div');
                newCardBody.className = 'card-body ks_chart_card_body';
                if (dashboardItemContainer) {
                    dashboardItemContainer?.appendChild(newCardBody);
                }
                var funnelRender = ks_gridstack_container.querySelectorAll('.ks_chart_card_body');
            }
            var funnel_data = JSON.parse(item.ks_chart_data);
            if (funnel_data['labels'] && funnel_data['datasets']){
                var ks_labels = funnel_data['labels'];
                var ks_data = funnel_data.datasets[0].data;
                const ks_sortobj = Object.fromEntries(
                ks_labels.map((key, index) => [key, ks_data[index]]),
                );
                const keyValueArray = Object.entries(ks_sortobj);
                keyValueArray.sort((a, b) => b[1] - a[1]);

                var data=[];
                if (keyValueArray.length){
                    for (let i=0 ; i<keyValueArray.length ; i++){
                    data.push({"stage":keyValueArray[i][0],"applicants":keyValueArray[i][1]})
                    }
                    var root = am5.Root.new(funnelRender[0]);
                    const theme = item.ks_chart_item_color
                    switch(theme){
                    case "default":
                        root.setThemes([am5themes_Animated.new(root)]);
                        break;
                    case "dark":
                        root.setThemes([am5themes_Dataviz.new(root)]);
                        break;
                    case "material":
                        root.setThemes([am5themes_Material.new(root)]);
                        break;
                    case "moonrise":
                        root.setThemes([am5themes_Moonrise.new(root)]);
                        break;
                    };

                    var chart = root.container.children.push(
                        am5percent.SlicedChart.new(root, {
                            layout: root.verticalLayout
                        })
                    );
                    // Create series
                    var series = chart.series.push(
                        am5percent.FunnelSeries.new(root, {
                            alignLabels: false,
                            name: "Series",
                            valueField: "applicants",
                            categoryField: "stage",
                            orientation: "vertical",
                        })
                    );
                    series.data.setAll(data);
                     series.appear(1000);
                    if(item.ks_show_data_value && item.ks_data_label_type=="value"){
                        series.labels.template.set("text", "{value}");
                    }else if(item.ks_show_data_value && item.ks_data_label_type=="percent"){
                        series.labels.template.set("text", "{valuePercentTotal.formatNumber('0.00')}%");
                    }else{
                        series.ticks.template.set("forceHidden", true);
                        series.labels.template.set("forceHidden", true);
                    }
                    var legend = chart.children.push(
                        am5.Legend.new(root, {
                            centerX: am5.p50,
                            x: am5.p50,
                            marginTop: 15,
                            marginBottom: 15
                        })
                    );
                    if(item.ks_hide_legend==true){
                        legend.data.setAll(series.dataItems);
                    }
                    chart.appear(1000, 100);

                    if(!this.chart_container){
                        this.chart_container = {};
                    }
                    this.chart_container[item.id] = chart;
                    series.slices._values.forEach((rec)=>{
                        rec.events.on("click",function(ev){
                            if (item.ks_data_calculation_type === 'custom' && self.ks_dashboard_data && !self.ks_dashboard_data['ks_ai_dashboard']){
                                self.onChartCanvasClick_funnel(ev,`${item.id}`, item)
                            }
                        })
                    })
                }else{
                    const ksChartCardBody = ks_gridstack_container.querySelector('.ks_chart_card_body');
                    ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
                }
            }else{
                const ksChartCardBody = ks_gridstack_container.querySelector('.ks_chart_card_body');
                ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
            }
            return ks_gridstack_container;
     }

     onChartCanvasClick(evt) {
        if(this.env.inDialog) return ;
        var self = this;
        this.ksUpdateDashboard = {};
        var item_id = parseInt(evt.target.parentElement.dataset.itemId, 10);
        var chart_title = '#' + CSS.escape(this.item.name);
//        var chart_title = '#' + this.item.name;

        if (this.ksUpdateDashboard[item_id]) {
            clearInterval(this.ksUpdateDashboard[item_id]);
            delete self.ksUpdateDashboard[item_id];
        }

        var item_data = self.ks_dashboard_data.ks_item_data[item_id];

        if (self.ks_dashboard_data.ks_item_data[item_id].max_sequnce) {

            var sequence = item_data.sequnce ? item_data.sequnce : 0;

            var domain = JSON.parse(evt.target.parentElement.dataset.domain);

            var lastSeq = parseInt(evt.target.parentElement.dataset.last_seq, 10);

            if (lastSeq !== sequence) {
                rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/ks_fetch_drill_down_data", {
                    model: 'ks_dashboard_ninja.item',
                    method: 'ks_fetch_drill_down_data',
                    args: [item_id, domain, sequence],
                    kwargs: {},
                }).then(function(result) {
                    if (result.ks_list_view_data) {
                        var chart_id_name = '#item' + '_' + '-1';
                        var id_name = '#' + result.ks_action_name + '_' + (result.sequence - 1);

                        if (self.ks_dashboard_data.ks_item_data[item_id].domains) {
                            self.ks_dashboard_data.ks_item_data[item_id].domains[result.sequence] = JSON.parse(result.ks_list_view_data).previous_domain;
                        } else {
                            self.ks_dashboard_data.ks_item_data[item_id].domains = {};
                            self.ks_dashboard_data.ks_item_data[item_id].domains[result.sequence] = JSON.parse(result.ks_list_view_data).previous_domain;
                        }

                        self.ks_dashboard_data.ks_item_data[item_id].isDrill = true;
                        self.ks_dashboard_data.ks_item_data[item_id].sequnce = result.sequence;
                        self.ks_dashboard_data.ks_item_data[item_id].ks_list_view_data = result.ks_list_view_data;
                        self.ks_dashboard_data.ks_item_data[item_id].ks_list_view_type = result.ks_list_view_type;
                        self.ks_dashboard_data.ks_item_data[item_id].ks_dashboard_item_type = 'ks_list_view';
                        self.ks_dashboard_data.ks_item_data[item_id].sequnce = result.sequence;

                        var gridItem = document.querySelector(".ks_dashboard_main_content .grid-stack-item[gs-id='" + item_id + "']");
                        gridItem?.querySelector(".ks_chart_heading")?.classList.add("d-none");
                        gridItem?.querySelector(".ks_list_view_heading")?.classList.add("d-none");
                        gridItem.querySelector(".card-body").innerHTML = "";
                        gridItem?.querySelector(chart_id_name)?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_search_plus")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_search_minus")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_dashboard_item_drill_up")?.classList.remove('d-none');
                        gridItem?.querySelector(chart_title)?.classList.remove('d-none');
                        gridItem?.querySelector(id_name)?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_pager")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_dashboard_item_action_export")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_dashboard_quick_edit_action_popup")?.classList.remove('d-sm-block');

                        var item_data = self.ks_dashboard_data.ks_item_data[item_id]
                        var list_view_data = JSON.parse(item_data.ks_list_view_data);

                        var $container = renderToElement('ks_dashboard_ninja.ks_new_list_view_table', {
                            list_view_data,item_id:self.item_id,self
                        });

                        gridItem?.querySelector(".card-body").append($container);

                    } else {
                        self.ks_dashboard_data.ks_item_data[item_id].ks_chart_data = result.ks_chart_data;
                        self.ks_dashboard_data.ks_item_data[item_id].sequnce = result.sequence;
                        self.ks_dashboard_data.ks_item_data[item_id].ks_dashboard_item_type = result.ks_chart_type;
                        self.ks_dashboard_data.ks_item_data[item_id].isDrill = true;

                        var chart_id_name = '#item' + '_' + '-1';
                        var id_name = '#' + result.ks_action_name + '_' + (result.sequence - 1);

                        if (self.ks_dashboard_data.ks_item_data[item_id].domains) {
                            self.ks_dashboard_data.ks_item_data[item_id].domains[result.sequence] = JSON.parse(result.ks_chart_data).previous_domain;
                        } else {
                            self.ks_dashboard_data.ks_item_data[item_id].domains = {};
                            self.ks_dashboard_data.ks_item_data[item_id].domains[result.sequence] = JSON.parse(result.ks_chart_data).previous_domain;
                        }

                        var gridItem = document.querySelector(".ks_dashboard_main_content .grid-stack-item[gs-id='" + item_id + "']");
                        gridItem?.querySelector(".ks_list_view_heading")?.classList.add("d-none");
                        gridItem?.querySelector(chart_id_name)?.classList.remove('d-none');
                        gridItem?.querySelector(chart_title)?.classList.remove('d-none');
                        gridItem?.querySelector(id_name)?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_dashboard_item_chart_info")?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_dashboard_color_option")?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_search_plus")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_search_minus")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_dashboard_item_drill_up")?.classList.remove('d-none');
                        gridItem?.querySelector(".ks_pager")?.classList.add('d-none');
                        gridItem?.querySelector(".ks_dashboard_quick_edit_action_popup")?.classList.remove('d-sm-block');
                        gridItem?.querySelector(".ks_dashboard_item_action_export")?.classList.add('d-none');
                        gridItem.querySelector(".card-body").innerHTML = "";

                        var item_data = self.ks_dashboard_data.ks_item_data[item_id]
                        if (item_data.ks_dashboard_item_type == 'ks_funnel_chart') {
                            gridItem.querySelector(".card-body").remove();
                            self.ksrenderfunnelchart(gridItem, item_data);
                        } else {
                            gridItem.querySelector(".card-body").remove();
                            self.ks_render_graphs(gridItem, item_data);
                        }
                    }
                });
            }
        }
        evt.stopPropagation();
    }

     async onChartCanvasClick_funnel(evt,item_id,item){
        var self = this;
        if(this.env.inDialog) return ;
        this.ksUpdateDashboard = {};
        if (item_id in self.ksUpdateDashboard) {
            clearInterval(self.ksUpdateDashboard[item_id]);
            delete self.ksUpdateDashboard[item_id]
        }
        var domain = [];
        var partner_id;
        var final_active;
        var index;
        var item_data = self.ks_dashboard_data.ks_item_data[item_id];
        var groupBy = JSON.parse(item_data["ks_chart_data"])['groupby'];
        var labels = JSON.parse(item_data["ks_chart_data"])['labels'];
        var domains = JSON.parse(item_data["ks_chart_data"])['domains'];
        var sequnce = item_data.sequnce ? item_data.sequnce : 0;
        var chart_title = '#'+item.name
        if (evt.target.dataItem){
            var activePoint = evt.target.dataItem.dataContext;
        }
        if (activePoint) {
            if (activePoint.category){
                for (var i=0 ; i<labels.length ; i++){
                    if (labels[i] == activePoint.category){
                        index = i
                    }
                }
                domain = domains[index];
            }
            else if (activePoint.stage){
                for (var i=0 ; i<labels.length ; i++){
                    let stage = true
                    if(activePoint.stage == "false"){
                        stage = false
                    }
                    if (labels[i] == stage){
                        index = i
                    }
                }
                domain = domains[index];
            }
            if (item_data.max_sequnce != 0 && sequnce < item_data.max_sequnce) {
                rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/ks_fetch_drill_down_data",{
                    model: 'ks_dashboard_ninja.item',
                    method: 'ks_fetch_drill_down_data',
                    args: [item_id, domain, sequnce],
                    kwargs : {},
                }).then(function(result) {
                    self.ks_dashboard_data.ks_item_data[item_id]['sequnce'] = result.sequence;
                    self.ks_dashboard_data.ks_item_data[item_id]['isDrill'] = true;
                    if (result.ks_chart_data) {

                        var chart_id_name = '#item'+'_' +'-1'
                        var id_name = '#'+result.ks_action_name + '_' + (result.sequence-1)
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_dashboard_item_type'] = result.ks_chart_type;
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_chart_data'] = result.ks_chart_data;
                        if (self.ks_dashboard_data.ks_item_data[item_id].domains) {
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'][result.sequence] = JSON.parse(result.ks_chart_data).previous_domain;
                        } else {
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'] = {}
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'][result.sequence] = JSON.parse(result.ks_chart_data).previous_domain;
                        }
                        var dashboardContent = document.querySelector(".ks_dashboard_main_content");
                        var gridItem = dashboardContent?.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);

                        if (gridItem) {
                            var children = gridItem.children[0];
                            var chartHeading = children?.querySelector(".ks_chart_heading");
                            if (chartHeading) chartHeading?.classList.add("d-none");
                            var chartIdElement = children?.querySelector(chart_id_name);
                            if (chartIdElement) chartIdElement?.classList.remove('d-none');

                            var drillUp = children?.querySelector(".ks_dashboard_item_drill_up");
                            if (drillUp) drillUp?.classList.remove('d-none');

                            var chartTitleElement = children?.querySelector(chart_title);
                            if (chartTitleElement) chartTitleElement?.classList.remove('d-none');

                            var idElement = children?.querySelector(id_name);
                            if (idElement) idElement?.classList.remove('d-none');

                            var chartInfo = children?.querySelector(".ks_dashboard_item_chart_info");
                            if (chartInfo) chartInfo?.classList.remove('d-none');

                            var colorOption = children?.querySelector(".ks_dashboard_color_option");
                            if (colorOption) colorOption?.classList.remove('d-none');

                            var quickEditPopup = children?.querySelector(".ks_dashboard_quick_edit_action_popup");
                            if (quickEditPopup) quickEditPopup?.classList.remove('d-sm-block');

                            var moreAction = children?.querySelector(".ks_dashboard_more_action");
                            if (moreAction) moreAction?.classList.add('d-none');
                            var cardBody = children?.querySelector(".card-body");
                            if (cardBody) cardBody.innerHTML = '';
                        }
                        var item_data = self.ks_dashboard_data.ks_item_data[item_id];
                        if (item_data.ks_dashboard_item_type === 'ks_funnel_chart') {
                            var dashboardContent = document.querySelector(".ks_dashboard_main_content");
                            var gridItem = dashboardContent?.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);

                            if (gridItem) {
                                var cardBody = gridItem?.querySelector(".card-body");
                                if (cardBody) {
                                    cardBody.remove();
                                }
                            }

                            self.ksrenderfunnelchart(gridItem, item_data);
                        } else {
                            var gridItem = dashboardContent?.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);
                            if (gridItem) {
                                var cardBody = gridItem?.querySelector(".card-body");
                                if (cardBody) {
                                    cardBody.remove();
                                }
                            }

                            self.ks_render_graphs(gridItem, item_data);
                        }
                    } else {
                        if ('domains' in self.ks_dashboard_data.ks_item_data[item_id]) {
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'][result.sequence] = JSON.parse(result.ks_list_view_data).previous_domain;
                        } else {
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'] = {}
                            self.ks_dashboard_data.ks_item_data[item_id]['domains'][result.sequence] = JSON.parse(result.ks_list_view_data).previous_domain;
                        }
                        var chart_id_name = '#item'+'_' +'-1'
                        var id_name = '#'+result.ks_action_name + '_' + (result.sequence-1)
                        self.ks_dashboard_data.ks_item_data[item_id]['isDrill'] = true;
                        self.ks_dashboard_data.ks_item_data[item_id]['sequnce'] = result.sequence;
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_list_view_data'] = result.ks_list_view_data;
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_list_view_type'] = result.ks_list_view_type;
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_dashboard_item_type'] = 'ks_list_view';

                        var dashboardContent = document.querySelector(".ks_dashboard_main_content");
                        var gridItem = dashboardContent?.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);
                        if (gridItem) {
                            var firstChild = gridItem.children[0];
                            var chartHeading = firstChild?.querySelector(".ks_chart_heading");
                            if (chartHeading) {
                                chartHeading?.classList.add("d-none");
                            }
                            var chartIdElement = firstChild?.querySelector(chart_id_name);
                            if (chartIdElement) {
                                chartIdElement?.classList.remove('d-none');
                            }
                            var drillUp = firstChild?.querySelector(".ks_dashboard_item_drill_up");
                            if (drillUp) {
                                drillUp?.classList.remove('d-none');
                            }

                            var chartTitleElement = firstChild?.querySelector(chart_title);
                            if (chartTitleElement) {
                                chartTitleElement?.classList.remove('d-none');
                            }

                            var idElement = firstChild?.querySelector(id_name);
                            if (idElement) {
                                idElement?.classList.remove('d-none');
                            }
                            var chartInfo = firstChild?.querySelector(".ks_dashboard_item_chart_info");
                            if (chartInfo) {
                                chartInfo.classList.add('d-none');
                            }

                            var colorOption = firstChild?.querySelector(".ks_dashboard_color_option");
                            if (colorOption) {
                                colorOption.classList.add('d-none');
                            }

                            var cardBody = firstChild?.querySelector(".card-body");
                            if (cardBody) {
                                cardBody.innerHTML = '';
                            }

                            var quickEditPopup = firstChild?.querySelector(".ks_dashboard_quick_edit_action_popup");
                            if (quickEditPopup) {
                                quickEditPopup.classList.remove('d-sm-block');
                            }

                            var moreAction = firstChild?.querySelector(".ks_dashboard_more_action");
                            if (moreAction) {
                                moreAction.classList.add('d-none');
                            }
                            if (cardBody) {
                                cardBody.classList.add('table-responsive');
                            }
                        }
                        var item_data = self.ks_dashboard_data.ks_item_data[item_id]
                        self.item = item_data
                        self.prepare_list();
                        var list_view_data = JSON.parse(item_data['ks_list_view_data'])

                        var $container = renderToElement('ks_dashboard_ninja.ks_new_list_view_table',{
                            list_view_data,item_id:self.item_id,self
                        })
                       if (gridItem) {
//                            var firstChild = gridItem.children[0];
                            var cardBody = gridItem?.querySelector(".card-body");
                            if (cardBody) {
                                cardBody.append($container);
                            }
                       }
                    }
                });
            } else {
            if (item_data.action) {
                    if (!item_data.ks_is_client_action){
                        var action = Object.assign({}, item_data.action);
                        if (action.view_mode.includes('tree')) action.view_mode = action.view_mode.replace('tree', 'list');
                        for (var i = 0; i < action.views.length; i++) action.views[i][1].includes('tree') ? action.views[i][1] = action.views[i][1].replace('tree', 'list') : action.views[i][1];
                        action['domain'] = domain || [];
                        action['search_view_id'] = [action.search_view_id, 'search']
                    }else{
                        var action = Object.assign({}, item_data.action[0]);
                        if (action.params){
                            action.params.default_active_id || 'mailbox_inbox';
                            }else{
                                action.params = {
                                'default_active_id': 'mailbox_inbox'
                                };
                                action.context = {}
                                action.context.params = {
                                'active_model': false
                                };
                            }
                    }
                } else {
                    var action = {
                        name: _t(item_data.name),
                        type: 'ir.actions.act_window',
                        res_model: item_data.ks_model_name,
                        domain: domain || [],
                        context: {
                            'group_by': groupBy ? groupBy:false ,
                        },
                        views: [
                            [false, 'list'],
                            [false, 'form']
                        ],
                        view_mode: 'list',
                        target: 'current',
                    }
                }
                if (item_data.ks_show_records) {

                    self.actionService.doAction(action, {
                        on_reverse_breadcrumb: self.on_reverse_breadcrumb,
                    });
                }
            }
        }
     }

     ksOnDrillUp(e) {
        var self = this;
        var item_id = e.currentTarget.dataset.itemId;
        var item_data = self.ks_dashboard_data.ks_item_data[item_id];
        var domain;
        var chart_name = '#'+item_data.name
        var sequence = parseInt(e.currentTarget.dataset.sequence)
        var chart_id_name =  '#item'+'_' +'-1'
        if(item_data) {

            if ('domains' in item_data) {
                domain = item_data['domains'][sequence+1] ? item_data['domains'][sequence+1] : []
                var sequnce = sequence;
                if (sequnce >= 0) {
                    rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/ks_fetch_drill_down_data",{
                        model: 'ks_dashboard_ninja.item',
                        method: 'ks_fetch_drill_down_data',
                        args: [item_id, domain, sequnce],
                        kwargs:{}
                    }).then((result) => {
                        self.ks_dashboard_data.ks_item_data[item_id]['ks_chart_data'] = result.ks_chart_data;
                        self.ks_dashboard_data.ks_item_data[item_id]['sequnce'] = result.sequence;
                        var id_name = '#'+result.ks_action_name + '_' + sequence;
                        var dashboardMainContent = document.querySelector(".ks_dashboard_main_content");
                        var gridStackItem = dashboardMainContent.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);
                        var firstChild = gridStackItem.children[0];
                        var idNameElement = firstChild.querySelector(id_name);
                        let ks_breadcrumb_elements = [];
                        if (idNameElement) {
                            let nextSibling = idNameElement.nextElementSibling;
                            while (nextSibling) {
                                ks_breadcrumb_elements.push(nextSibling);
                                nextSibling = nextSibling.nextElementSibling;
                            }
                        }
                        if (result.ks_chart_type)  self.ks_dashboard_data.ks_item_data[item_id]['ks_dashboard_item_type'] = result.ks_chart_type;
                        const drillUpElement = firstChild.querySelector(".ks_dashboard_item_drill_up");
                        if (drillUpElement) {
                            drillUpElement.classList.remove('d-none');
                        }
                        const cardBody = firstChild.querySelector(".card-body");
                        if (cardBody) {
                            cardBody.innerHTML = '';
                        }
                        if (result.ks_chart_data) {
                            var item_data = self.ks_dashboard_data.ks_item_data[item_id];
                            ks_breadcrumb_elements.forEach((item, index) => {
                                item.classList.add("d-none");
                            })

                            const firstChild = gridStackItem.children[0];
                            const chartInfoElement = firstChild.querySelector(".ks_dashboard_item_chart_info");
                            if (chartInfoElement) {
                                chartInfoElement.classList.remove('d-none');
                            }
                            const colorOptionElement = firstChild.querySelector(".ks_dashboard_color_option");
                            if (colorOptionElement) {
                                colorOptionElement.classList.remove('d-none');
                            }
                            const cardBody = gridStackItem.querySelector(".card-body");
                            if (cardBody) {
                                cardBody.remove();
                            }
                            if (result.ks_chart_type === "ks_funnel_chart") {
                                self.ksrenderfunnelchart(gridStackItem, item_data);
                            } else {
                                self.ks_render_graphs(gridStackItem, item_data);
                            }
                        } else {
                            self.ks_dashboard_data.ks_item_data[item_id]['ks_list_view_data'] = result.ks_list_view_data;
                            self.ks_dashboard_data.ks_item_data[item_id]['ks_list_view_type'] = result.ks_list_view_type;
                            self.ks_dashboard_data.ks_item_data[item_id]['ks_dashboard_item_type'] = 'ks_list_view';
                            var item_data = self.ks_dashboard_data.ks_item_data[item_id]
                            ks_breadcrumb_elements.forEach((item, index) => {
                                item.classList.add("d-none");
                            })
                            self.prepare_list(item_data);

                            const pagerElement = firstChild.querySelector(".ks_pager");
                            if (pagerElement) {
                                pagerElement.classList.add('d-none');
                            }
                            const chartInfoElement = firstChild.querySelector(".ks_dashboard_item_chart_info");
                            if (chartInfoElement) {
                                chartInfoElement.classList.add('d-none');
                            }
                            const colorOptionElement = firstChild.querySelector(".ks_dashboard_color_option");
                            if (colorOptionElement) {
                                colorOptionElement.classList.add('d-none');
                            }
                            var list_view_data = JSON.parse(item_data['ks_list_view_data'])

                            var container = renderToElement('ks_dashboard_ninja.ks_new_list_view_table',{
                            list_view_data,item_id:self.item_id,self
                            })
                            const cardBody = firstChild.querySelector(".card-body");
                            if (cardBody) {
                                cardBody.appendChild(container);
                            }
                        }

                    });

                } else {
                    var dashboardMainContent = document.querySelector(".ks_dashboard_main_content");
                    var gridStackItem = dashboardMainContent.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);
                    var firstChild = gridStackItem.children[0];
                    var chartElement = firstChild.querySelector(chart_id_name);
                    let ks_breadcrumb_elements = [];

                    if (chartElement) {
                        let nextSibling = chartElement.nextElementSibling;
                        while (nextSibling) {
                            ks_breadcrumb_elements.push(nextSibling);
                            nextSibling = nextSibling.nextElementSibling;
                        }
                    }

                    if (chartElement) {
                        chartElement.classList.add('d-none');
                    }

                    ks_breadcrumb_elements.forEach((item) => {
                        item.classList.add("d-none");
                    });


                    const chartHeading = gridStackItem.querySelector(".ks_chart_heading");
                    if (chartHeading) {
                        chartHeading.classList.remove('d-none');
                    }

                    const listViewHeading = gridStackItem.querySelector(".ks_list_view_heading");
                    if (listViewHeading) {
                        listViewHeading.classList.remove('d-none');
                    }

//                    const chartNameElement = firstChild.querySelector(chart_name);
//                    if (chartNameElement) {
//                        chartNameElement.classList.add('d-none');
//                    }

                    const drillUpElement = firstChild.querySelector(".ks_dashboard_item_drill_up");
                    if (drillUpElement) {
                        drillUpElement.classList.add('d-none');
                    }

                    const chartInfoElement = firstChild.querySelector(".ks_dashboard_item_chart_info");
                    if (chartInfoElement) {
                        chartInfoElement.classList.remove('d-none');
                    }

                    const colorOptionElement = firstChild.querySelector(".ks_dashboard_color_option");
                    if (colorOptionElement) {
                        colorOptionElement.classList.remove('d-none');
                    }

                    const quickEditActionPopup = firstChild.querySelector(".ks_dashboard_quick_edit_action_popup");
                    if (quickEditActionPopup) {
                        quickEditActionPopup.classList.add('d-sm-block');
                    }
                    const moreActionElement = firstChild.querySelector(".ks_dashboard_more_action");
                    if (moreActionElement) {
                        moreActionElement.classList.remove('d-none');
                    }

                    const exportActionElement = firstChild.querySelector(".ks_dashboard_item_action_export");
                    if (exportActionElement) {
                        exportActionElement.classList.remove('d-none');
                    }

                    const searchPlusElement = firstChild.querySelector(".ks_search_plus");
                    if (searchPlusElement) {
                        searchPlusElement.classList.remove('d-none');
                    }

                    const searchMinusElement = firstChild.querySelector(".ks_search_minus");
                    if (searchMinusElement) {
                        searchMinusElement.classList.remove('d-none');
                    }

                    self.ksFetchChartItem(item_id);

                    const updateValue = self.ks_dashboard_data.ks_set_interval;
                    if (updateValue) {
                        const updateInterval = setInterval(() => {
                            self.ksFetchChartItem(item_id);
                        }, updateValue);

                        self.ksUpdateDashboard[item_id] = updateInterval;
                    }
                }
            } else {

                 if (!domain) {
                    let dashboardMainContent = document.querySelector(".ks_dashboard_main_content");
                    let gridStackItem = dashboardMainContent?.querySelector(`.grid-stack-item[gs-id="${item_id}"]`);
                    let firstChild = gridStackItem?.children[0];
                    let drillUpElement = firstChild?.querySelector(".ks_dashboard_item_drill_up");
                    drillUpElement?.classList.add('d-none');
                 }

            }
        }
        e.stopPropagation();
    }

    ksFetchChartItem(id) {
        var self = this;
        var item_data = self.ks_dashboard_data.ks_item_data[id];

        return rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_item",{
            model: 'ks_dashboard_ninja.board',
            method: 'ks_fetch_item',
            args: [
                [item_data.id], self.ks_dashboard_data.ks_dashboard_id, {}
            ],
            kwargs:{},
        }).then(function(new_item_data) {
            self.ks_dashboard_data.ks_item_data[id] = new_item_data[id];

            var gridStackItem = document?.querySelector(`.ks_dashboard_main_content .grid-stack-item[gs-id="${id}"]`);
            if (gridStackItem) {
                var cardBody = gridStackItem.children[0].querySelector('.card-body');
                if (cardBody) {
                    cardBody.innerHTML = '';
                }
            }

            var item_data = self.ks_dashboard_data.ks_item_data[id];

            if (item_data.ks_list_view_data) {
                self.actionService.doAction({
                    type: "ir.actions.client",
                    tag: "reload",
                });
            } else if (item_data.ks_dashboard_item_type === 'ks_funnel_chart') {
                var cardBodyToRemove = gridStackItem?.querySelector('.card-body');
                if (cardBodyToRemove) {
                    cardBodyToRemove.remove();
                }

                var name = item_data.name ? item_data.name : item_data.ks_model_display_name;

                var chartHeading = gridStackItem?.querySelector('.ks_chart_heading');
                if (chartHeading) {
                    chartHeading.setAttribute('title', name);
                    chartHeading.textContent = name;
                }

                self.ksrenderfunnelchart(gridStackItem, item_data);
            } else {
                var cardBodyToRemove = gridStackItem?.querySelector('.card-body');
                if (cardBodyToRemove) {
                    cardBodyToRemove.remove();
                }

                self.ks_render_graphs(gridStackItem, item_data);
            }
        }.bind(this));
    }


    async ksrendermapview(ks_map_view_tmpl,item){

        var self =this;
        if(ks_map_view_tmpl?.querySelectorAll('.ks_chart_card_body').length > 0){
           var mapRender = ks_map_view_tmpl?.querySelectorAll('.ks_chart_card_body');
        }else{
//            $($ks_map_view_tmpl.find('.ks_dashboarditem_chart_container')[0]).append("<div class='card-body ks_chart_card_body'>");
            var chartContainer = ks_map_view_tmpl?.querySelector('.ks_dashboarditem_chart_container');
            if (chartContainer) {
                var newDiv = document.createElement('div');
                newDiv.className = 'card-body ks_chart_card_body';
                chartContainer?.appendChild(newDiv);
//                chartContainer.forEach((chart_div) => { chart_div.appendChild(newDiv) } );
            }
            var mapRender = ks_map_view_tmpl?.querySelectorAll('.ks_chart_card_body');
        }
        var map_data = JSON.parse(item.ks_chart_data);
        var ks_data=[];
        let data = [];
        let label_data = [];
        let query_label_data = [];
        let domain = [];
        let partner_domain = [];
        var partners = [];
        if (map_data.groupByIds?.length){
            partners = map_data['partner']
        var partners_query = [];
        partners_query = map_data['ks_partners_map']
        var ks_labels = map_data['labels'];
        if (map_data.datasets.length){
            var ks_data = map_data.datasets[0].data;
        }
        if (item.ks_data_calculation_type === 'query'){
            for (let i=0 ; i<ks_labels.length ; i++){
                if (ks_labels[i] !== false){
                    if (typeof ks_labels[i] == 'string'){
                        if (ks_labels[i].includes(',')){
                            ks_labels[i] = ks_labels[i].split(', ')[1]
                        }
                        query_label_data.push(ks_labels[i])
                    }else{
                        query_label_data.push(ks_labels[i])
                    }
                }
            }
            for (let i=0 ; i<query_label_data.length ; i++){
                if (typeof query_label_data[i] == 'string'){
                    for (let j=0 ; j<partners_query.length ; j++){
                        if (query_label_data[i] == partners_query[j].name){
                            data.push({"title":query_label_data[i], "latitude":partners_query[j].partner_latitude, "longitude": partners_query[j].partner_longitude});
                        }
                    }
                }else{
                      data.push({"title":query_label_data[i], "latitude":partners_query[i].partner_latitude, "longitude": partners_query[i].partner_longitude});
                }
            }
        }
        if (ks_data.length && ks_labels.length){
            if (item.ks_data_calculation_type !== 'query'){
                for (let i=0 ; i<ks_labels.length ; i++){
                    if (ks_labels[i] !== false){
                        if (ks_labels[i].includes(',')){
                            ks_labels[i] = ks_labels[i].split(', ')[1]
                        }
                        label_data.push({'title': ks_labels[i], 'value':ks_data[i]})
                    }
                }
                for (let i=0 ; i<label_data.length ; i++){
                    for (let j=0 ; j<partners.length ; j++){
                        if (label_data[i].title == partners[j].name){
                            partners[j].name = partners[j].name + ';' + label_data[i].value
                        }
                    }
                }
                for (let i=0 ; i<partners.length ; i++){
                    data.push({"title":partners[i].name, "latitude":partners[i].partner_latitude, "longitude": partners[i].partner_longitude});
                }
            }
            const root = am5.Root.new(mapRender[0]);
            root.setThemes([am5themes_Animated.new(root)]);

            // Create the map chart
            var chart = root.container.children.push(
              am5map.MapChart.new(root, {
                panX: "translateX",
                panY: "translateY",
                projection: am5map.geoMercator()
              })
            );

            var cont = chart.children.push(
              am5.Container.new(root, {
                layout: root.horizontalLayout,
                x: 20,
                y: 40
              })
            );

            // Add labels and controls
            cont.children.push(
              am5.Label.new(root, {
                centerY: am5.p50,
                text: "Map"
              })
            );

            var switchButton = cont.children.push(
              am5.Button.new(root, {
                themeTags: ["switch"],
                centerY: am5.p50,
                icon: am5.Circle.new(root, {
                  themeTags: ["icon"]
                })
              })
            );

            switchButton.on("active", function() {
              if (!switchButton.get("active")) {
                chart.set("projection", am5map.geoMercator());
                chart.set("panY", "translateY");
                chart.set("rotationY", 0);
                backgroundSeries.mapPolygons.template.set("fillOpacity", 0);
              } else {
                chart.set("projection", am5map.geoOrthographic());
                chart.set("panY", "rotateY");

                backgroundSeries.mapPolygons.template.set("fillOpacity", 0.1);
              }
            });

            cont.children.push(
              am5.Label.new(root, {
                centerY: am5.p50,
                text: "Globe"
              })
            );

            // Create series for background fill
            var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
            backgroundSeries.mapPolygons.template.setAll({
              fill: root.interfaceColors.get("alternativeBackground"),
              fillOpacity: 0,
              strokeOpacity: 0
            });

                // Add background polygon
            backgroundSeries.data.push({
              geometry: am5map.getGeoRectangle(90, 180, -90, -180)
            });

            // Create main polygon series for countries
            var polygonSeries = chart.series.push(
              am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldLow,
                exclude: ["AQ"]
              })
            );
            polygonSeries.mapPolygons.template.setAll({
              tooltipText: "{name}",
              toggleKey: "active",
              interactive: true
            });

            polygonSeries.mapPolygons.template.states.create("hover", {
              fill: root.interfaceColors.get("primaryButtonHover")
            });

            polygonSeries.mapPolygons.template.states.create("active", {
              fill: root.interfaceColors.get("primaryButtonHover")
            });

            var previousPolygon;

            polygonSeries.mapPolygons.template.on("active", function (active, target) {
              if (previousPolygon && previousPolygon != target) {
                previousPolygon.set("active", false);
              }
              if (target.get("active")) {
                polygonSeries.zoomToDataItem(target.dataItem );
              }
              else {
                chart.goHome();
              }
              previousPolygon = target;
            });

            // Create line series for trajectory lines
            var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
            lineSeries.mapLines.template.setAll({
              stroke: root.interfaceColors.get("alternativeBackground"),
              strokeOpacity: 0.3
            });

            // Create point series for markers
            var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
            var colorset = am5.ColorSet.new(root, {});
            const self = root;


            pointSeries.bullets.push(function() {
              var container = am5.Container.new(self, {
                tooltipText: "{title}",
                cursorOverStyle: "pointer"
              });

              var circle = container.children.push(
                am5.Circle.new(self, {
                  radius: 4,
                  tooltipY: 0,
                  fill: colorset.next(),
                  strokeOpacity: 0
                })
              );


              var circle2 = container.children.push(
                am5.Circle.new(self, {
                  radius: 4,
                  tooltipY: 0,
                  fill: colorset.next(),
                  strokeOpacity: 0,
                  tooltipText: "{title}"
                })
              );

              circle.animate({
                key: "scale",
                from: 1,
                to: 5,
                duration: 600,
                easing: am5.ease.out(am5.ease.cubic),
                loops: Infinity
              });

              circle.animate({
                key: "opacity",
                from: 1,
                to: 0.1,
                duration: 600,
                easing: am5.ease.out(am5.ease.cubic),
                loops: Infinity
              });

              return am5.Bullet.new(self, {
                sprite: container
              });
            });

            for (var i = 0; i < data.length; i++) {
              var final_data = data[i];
              addCity(final_data.longitude, final_data.latitude, final_data.title);
            }
            function addCity(longitude, latitude, title) {
              pointSeries.data.push({
                geometry: { type: "Point", coordinates: [longitude, latitude] },
                title: title,
              });
            }

            // Add zoom control
            chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

            // Set clicking on "water" to zoom out
            chart.chartContainer.get("background").events.on("click", function () {
              chart.goHome();
            })

            // Make stuff animate on load
            chart.appear(1000, 100);
            this.chart_container[item.id] = chart;

        }else{
             const ksChartCardBody = ks_map_view_tmpl?.querySelector('.ks_chart_card_body');
             ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
        }
        }else{
            const ksChartCardBody = ks_map_view_tmpl?.querySelector('.ks_chart_card_body');
             ksChartCardBody.innerHTML += renderToString("ksNoItemChartView", {});
        }
        return ks_map_view_tmpl;
    }

     ksRenderChartColorOptions(e) {
        var self = this;
        var currentTargetParent = e.currentTarget.parentNode;
        var currentTargetGrandParent = currentTargetParent.parentNode;
        if (!currentTargetParent.classList.contains('ks_date_filter_selected')) {
            //            FIXME : Correct this later.
            var selectedFilter = currentTargetGrandParent.querySelector('.ks_date_filter_selected');
            if (selectedFilter) {
                selectedFilter.classList.remove('ks_date_filter_selected');
            }
            currentTargetParent.classList.add('ks_date_filter_selected');
            var itemId = parseInt(currentTargetGrandParent.dataset.itemId);
            var item_data = self.ks_dashboard_data.ks_item_data[itemId];
            var chart_data = JSON.parse(item_data.ks_chart_data);

            rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/write",{
                    model: 'ks_dashboard_ninja.item',
                    method: 'write',
                    args: [itemId, {
                        "ks_chart_item_color": e.currentTarget.dataset.chartColor
                    }],
                    kwargs:{}
            }).then(function() {
                    self.ks_dashboard_data.ks_item_data[itemId]['ks_chart_item_color'] = e.target.dataset.chartColor;
                    var gridStackItem = document.querySelector(`.grid-stack-item[gs-id="${item_data.id}"]`);
                    var cardBody = gridStackItem.querySelector(".card-body");
                    if (cardBody) {
                        cardBody.remove();
                    }
                    if (item_data.ks_dashboard_item_type == 'ks_funnel_chart'){
                        self.ksrenderfunnelchart(self.ks_gridstack_container.el, item_data);
                    }else{
                        self.ks_render_graphs(self.ks_gridstack_container.el, item_data);
                    }
            })
        }
    }

        ksLoadMoreRecords(e) {
            var self = this;
            var ks_intial_count = e.target.parentElement.dataset.prevOffset;
            var ks_offset = e.target.parentElement.dataset.next_offset;
            var itemId = e.currentTarget.dataset.itemId;
            var offset = self.ks_dashboard_data.ks_item_data[itemId].ks_pagination_limit;
            var context = self.ks_dashboard_data['context']
            var params;
            if(this.props?.item?.ks_dashboard_item_type === 'ks_list_view' && this.env.inDialog){
                this.env.bus.trigger("GET:ParamsForItemFetch", {item_id: parseInt(itemId), isCarouselParentClass: true});
                params = this.domainParams
            }
            else
                params = self.__owl__.parent.component.ksGetParamsForItemFetch(parseInt(itemId));
            rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_get_list_view_data_offset",{
                model: 'ks_dashboard_ninja.board',
                method: 'ks_get_list_view_data_offset',
                args: [parseInt(itemId), {
                    ks_intial_count: ks_intial_count,
                    offset: ks_offset,
                    }, parseInt(self.ks_dashboard_data.ks_dashboard_id), params],
                kwargs:{context:context}
            }).then(function(result) {
                if(result.ks_list_view_data){
                    result.ks_list_view_data = self.renderListViewData(result)
                }
                var item_data = self.ks_dashboard_data.ks_item_data[itemId];
                var item_view = document.querySelector(".ks_dashboard_main_content .grid-stack-item[gs-id='" + item_data.id + "']");

                self.item.ks_list_view_data = result.ks_list_view_data;
                self.prepare_list();

                var pagerValue = e.target.closest('.ks_pager').querySelector('.ks_value');
                pagerValue.textContent = result.offset + "-" + result.next_offset;

                e.target.parentElement.dataset.next_offset = result.next_offset;
                e.target.parentElement.dataset.prevOffset = result.offset;

                var loadPreviousButton = e.target.parentElement.querySelector('.ks_load_previous');
                loadPreviousButton.classList.remove('ks_event_offer_list');

                if (result.next_offset < parseInt(result.offset) + (offset - 1) ||
                    result.next_offset == item_data.ks_record_count ||
                    result.next_offset === result.limit) {

                    e.target.classList.add('ks_event_offer_list');
                }
            });
        }

        getDomainParams(ev){
            this.domainParams = ev.detail;
        }

        ksLoadPreviousRecords(e) {
            var self = this;
            var itemId = e.currentTarget.dataset.itemId;
            var offset = self.ks_dashboard_data.ks_item_data[itemId].ks_pagination_limit;
            var ks_offset =  parseInt(e.target.parentElement.dataset.prevOffset) - (offset + 1) ;
            var ks_intial_count = e.target.parentElement.dataset.next_offset;
            var context = self.ks_dashboard_data['context']
            var params;
            if(this.props?.item?.ks_dashboard_item_type === 'ks_list_view' && this.env.inDialog){
                this.env.bus.trigger("GET:ParamsForItemFetch", {item_id: parseInt(itemId), isCarouselParentClass: true});
                params = this.domainParams
            }
            else
                params = self.__owl__.parent.component.ksGetParamsForItemFetch(parseInt(itemId));

            rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_get_list_view_data_offset",{
                model: 'ks_dashboard_ninja.board',
                method: 'ks_get_list_view_data_offset',
//                context: self.getContext(),
                args: [parseInt(itemId), {
                    ks_intial_count: ks_intial_count,
                    offset: ks_offset,
                    }, parseInt(self.ks_dashboard_data.ks_dashboard_id), params],
                kwargs:{context:context}
            }).then(function(result) {
                if(result.ks_list_view_data){
                    result.ks_list_view_data = self.renderListViewData(result)
                }
                var item_data = self.ks_dashboard_data.ks_item_data[itemId];
                var item_view = document.querySelector(".ks_dashboard_main_content .grid-stack-item[gs-id='" + item_data.id + "']");

                self.item.ks_list_view_data = result.ks_list_view_data;
                self.prepare_list();

                var pagerValue = e.target.closest('.ks_pager').querySelector('.ks_value');
                pagerValue.textContent = result.offset + "-" + result.next_offset;

                e.target.parentElement.dataset.next_offset = result.next_offset;
                e.target.parentElement.dataset.prevOffset = result.offset;

                var loadNextButton = e.target.parentElement.querySelector('.ks_load_next');
                loadNextButton.classList.remove('ks_event_offer_list');

                if (result.offset === 1) {
                    e.target.classList.add('ks_event_offer_list');
                }
            });
        }

        ksOnListItemInfoClick(e) {
            var self = this;
            var item_id = e.currentTarget.dataset.itemId;
            var item_data = self.ks_dashboard_data.ks_item_data[item_id];
            var action = {
                name: _t(item_data.name),
                type: 'ir.actions.act_window',
                res_model: e.currentTarget.dataset.model,
                domain: item_data.ks_domain || [],
                views: [
                    [false, 'list'],
                    [false, 'form']
                ],
                target: 'current',
            }
            if (e.currentTarget.dataset.listViewType === "ungrouped") {
                action['view_mode'] = 'form';
                action['views'] = [
                    [false, 'form']
                ];
                action['res_id'] = parseInt(e.currentTarget.dataset.recordId);
            } else {
                if (e.currentTarget.dataset.listType === "date_type") {
                    var domain = JSON.parse(e.currentTarget.parentElement.parentElement.dataset.domain);
                    action['view_mode'] = 'list';
                    action['context'] = {
                        'group_by': e.currentTarget.dataset.groupby,
                    };
                    action['domain'] = domain;
                } else if (e.currentTarget.dataset.listType === "relational_type") {
                    var domain = JSON.parse(e.currentTarget.parentElement.parentElement.dataset.domain);
                    action['view_mode'] = 'list';
                    action['context'] = {
                        'group_by': e.currentTarget.dataset.groupby,
                    };
                    action['domain'] = domain;
                    action['context']['search_default_' + e.currentTarget.dataset.groupby] = parseInt(e.currentTarget.dataset.recordId);
                } else if (e.currentTarget.dataset.listType === "other") {
                    var domain = JSON.parse(e.currentTarget.parentElement.parentElement.dataset.domain);
                    action['view_mode'] = 'list';
                    action['context'] = {
                        'group_by': e.currentTarget.dataset.groupby,
                    };
                    action['context']['search_default_' + e.currentTarget.dataset.groupby] = parseInt(e.currentTarget.dataset.recordId);
                    action['domain'] = domain;
                }
            }
            self.actionService.doAction(action)
        }

};

Ksdashboardgraph.props = {
    item: { type: Object, Optional:true},
    dashboard_data: { type: Object, Optional:true},
    ksdatefilter : {type: String ,Optional:true},
    pre_defined_filter :{type:Object, Optional:true},
    custom_filter :{type:Object, Optional:true},
    ks_speak:{type:Function , Optional:true},
    hideButtons: { type: Number, optional: true },
    generate_dialog: { type: Boolean, optional: true },
    explain_ai_whole: { type: Boolean, optional: true }
};

Ksdashboardgraph.template = "Ks_chart_list_container";
