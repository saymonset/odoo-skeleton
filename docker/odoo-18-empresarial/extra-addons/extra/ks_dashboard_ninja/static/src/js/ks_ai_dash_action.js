/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, onWillStart, useState ,onMounted, onWillRender, useRef, onWillPatch } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { renderToString,renderToElement } from "@web/core/utils/render";
import { useService } from "@web/core/utils/hooks";
import { localization } from "@web/core/l10n/localization";
import { browser } from '@web/core/browser/browser';
import { strftimeToLuxonFormat } from "@web/core/l10n/dates";
import { session } from "@web/session";
import { download } from "@web/core/network/download";
import { BlockUI } from "@web/core/ui/block_ui";
import { WebClient } from "@web/webclient/webclient";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { patch } from "@web/core/utils/patch";
import { isBrowserChrome, isMobileOS } from "@web/core/browser/feature_detection";
import { loadBundle } from '@web/core/assets';
import {globalfunction } from '@ks_dashboard_ninja/js/ks_global_functions'
import { Ksdashboardtile } from '@ks_dashboard_ninja/components/ks_dashboard_tile_view/ks_dashboard_tile';
//import { Ksdashboardlistview } from '@ks_dashboard_ninja/components/ks_dashboard_list_view/ks_dashboard_list';
import { Ksdashboardtodo } from '@ks_dashboard_ninja/components/ks_dashboard_to_do_item/ks_dashboard_to_do';
import { Ksdashboardkpiview } from '@ks_dashboard_ninja/components/ks_dashboard_kpi_view/ks_dashboard_kpi';
import { Ksdashboardgraph } from '@ks_dashboard_ninja/components/ks_dashboard_graphs/ks_dashboard_graphs';
import { Dialog } from "@web/core/dialog/dialog";
import { rpc } from "@web/core/network/rpc";


export class KsAIDashboardNinja extends Component {

    setup() {
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.notification = useService("notification");
        this.dialogService = useService("dialog");
        this.header =  useRef("ks_dashboard_header");
        this.footer =  useRef("ks_dashboard_footer");
        this.main_body = useRef("ks_main_body");
        this.grid_stack = useRef("ks_grid_stack")
        this.reload_menu_option = {
            reload:this.props.action.context.ks_reload_menu,
            menu_id: this.props.action.context.ks_menu_id
        };
        this.generate_dialog = false;
        this.generate_dialog = this.props.action.context.generate_dialog ? true : false;
        this.ks_ai_dash_id = this.props.action.context['ks_dash_id'];
        this.ks_ai_dash_name = this.props.action.context['ks_dash_name'];
       this.ks_ai_del_id =this.props.action.context['ks_delete_dash_id'];
        this.ks_mode = 'active';
        this.action_manager = parent;
//      this.controllerID = params.controllerID;
        this.name = "ks_dashboard";
        this.ksIsDashboardManager = false;
        this.ksDashboardEditMode = false;
        this.ksNewDashboardName = false;
        this.file_type_magic_word = {
            '/': 'jpg',
            'R': 'gif',
            'i': 'png',
            'P': 'svg+xml',
        };
        this.ksAllowItemClick = true;

        //Dn Filters Iitialization

        this.date_format = localization.dateFormat
        //        this.date_format = this.date_format.replace(/\bYY\b/g, "YYYY");
        this.datetime_format = localization.dateTimeFormat
        //            this.is_dateFilter_rendered = false;
        this.ks_date_filter_data;

        // Adding date filter selection options in dictionary format : {'id':{'days':1,'text':"Text to show"}}
        this.ks_date_filter_selections = {
            'l_none': _t('Date Filter'),
            'l_day': _t('Today'),
            't_week': _t('This Week'),
            'td_week': _t('Week To Date'),
            't_month': _t('This Month'),
            'td_month': _t('Month to Date'),
            't_quarter': _t('This Quarter'),
            'td_quarter': _t('Quarter to Date'),
            't_year': _t('This Year'),
            'td_year': _t('Year to Date'),
            'n_day': _t('Next Day'),
            'n_week': _t('Next Week'),
            'n_month': _t('Next Month'),
            'n_quarter': _t('Next Quarter'),
            'n_year': _t('Next Year'),
            'ls_day': _t('Last Day'),
            'ls_week': _t('Last Week'),
            'ls_month': _t('Last Month'),
            'ls_quarter': _t('Last Quarter'),
            'ls_year': _t('Last Year'),
            'l_week': _t('Last 7 days'),
            'l_month': _t('Last 30 days'),
            'l_quarter': _t('Last 90 days'),
            'l_year': _t('Last 365 days'),
            'ls_past_until_now': _t('Past Till Now'),
            'ls_pastwithout_now': _t('Past Excluding Today'),
            'n_future_starting_now': _t('Future Starting Now'),
            'n_futurestarting_tomorrow': _t('Future Starting Tomorrow'),
            'l_custom': _t('Custom Filter'),
        };
        // To make sure date filter show date in specific order.
        this.ks_date_filter_selection_order = ['l_day', 't_week', 't_month', 't_quarter','t_year',
            'td_week','td_month','td_quarter', 'td_year','n_day','n_week', 'n_month', 'n_quarter', 'n_year',
            'ls_day','ls_week', 'ls_month', 'ls_quarter', 'ls_year', 'l_week', 'l_month', 'l_quarter', 'l_year',
            'ls_past_until_now', 'ls_pastwithout_now','n_future_starting_now', 'n_futurestarting_tomorrow',
            'l_custom'
        ];

        this.ks_dashboard_id = this.props.action.params.ks_dashboard_id;

        this.gridstack_options = {
            staticGrid:true,
            float: false,
            cellHeight: 80,
            styleInHead : true,
//          disableOneColumnMode: true,
        };
        this.ksSelectedgraphid = [];
        if (isMobileOS()) {
            this.gridstack_options.disableOneColumnMode = false
        }
        this.gridstackConfig = {};
        this.grid = true;
        this.chartMeasure = {};
        this.chart_container = {};
        this.list_container = {};
        this.state = useState({
            ks_dashboard_name: '',
            ks_multi_layout: false,
            ks_dash_name: '',
            ks_dashboard_manager :false,
            date_selection_data: {},
            date_selection_order :[],
            ks_show_create_layout_option : true,
            ks_show_layout :false,
            ks_selected_board_id:false,
            ks_child_boards:false,
            ks_dashboard_data:{},
            ks_dn_pre_defined_filters:[],
            ks_dashboard_item_length:0,
            ks_dashboard_items:[],
            ksDateFilterSelection:'none',
            pre_defined_filter:{},
            custom_filter:{}
        })
        this.ksChartColorOptions = ['default', 'cool', 'warm', 'neon'];
        //       this.ksUpdateDashboardItem = this.ksUpdateDashboardItem.bind(this);
        this.ksDateFilterSelection = false;
        this.ksDateFilterStartDate = false;
        this.ksDateFilterEndDate = false;
        this.ksUpdateDashboard = {};
        var head = document.getElementsByTagName('head')[0];
        var meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, user-scalable=no';
        head.appendChild(meta);

        if(this.props.action.context.ks_reload_menu){
            this.trigger_up('reload_menu_data', { keep_open: true, scroll_to_bottom: true});
        }
        var context = {
            ksDateFilterSelection: self.ksDateFilterSelection,
            ksDateFilterStartDate: self.ksDateFilterStartDate,
            ksDateFilterEndDate: self.ksDateFilterEndDate,
        }
        this.dn_state = {}
        this.dn_state['user_context']=context
        onWillStart(this.willStart);
        onWillRender(this.dashboard_mount);
        onMounted(() => {
            this.grid_initiate();
        });
    }

    willStart(){
        var self = this;
        var def;
        if (this.reload_menu_option.reload && this.reload_menu_option.menu_id) {
            def = this.getParent().actionService.ksDnReloadMenu(this.reload_menu_option.menu_id);
        }
        return Promise.all([def, loadBundle("ks_dashboard_ninja.ks_dashboard_lib")])
        .then(function() {
            return self.ks_fetch_data().then(function() {
                return self.ks_fetch_items_data();
            });
        });

    }

    grid_initiate() {
    var inactiveModal = document.querySelector(".o_dialog .o_inactive_modal");
    if (inactiveModal) {
        inactiveModal.remove();
    }
    if (!this.generate_dialog) {
        var self = this;
        var gridStackContainer = this.grid_stack.el;
        if (gridStackContainer) {
            this.grid = GridStack.init(this.gridstack_options, gridStackContainer);

            if (this.ks_dashboard_data.ks_gridstack_config) {
                this.gridstackConfig = JSON.parse(this.ks_dashboard_data.ks_gridstack_config);
            }

            // Add widgets to the grid
            this.state.ks_dashboard_items.forEach(function (item) {
                var graphs = ['ks_scatter_chart', 'ks_bar_chart', 'ks_horizontalBar_chart', 'ks_line_chart', 'ks_area_chart', 'ks_doughnut_chart', 'ks_polarArea_chart', 'ks_pie_chart', 'ks_flower_view', 'ks_radar_view', 'ks_radialBar_chart', 'ks_map_view', 'ks_funnel_chart', 'ks_bullet_chart', 'ks_to_do', 'ks_list_view'];
                var ksPreview = document.getElementById(item.id);

                if (ksPreview) {
                    if (self.gridstackConfig[item.id]) {
                        self.grid.addWidget(ksPreview, {
                            x: self.gridstackConfig[item.id].x,
                            y: self.gridstackConfig[item.id].y,
                            w: self.gridstackConfig[item.id].w,
                            h: self.gridstackConfig[item.id].h,
                            autoPosition: true,
                            minW: 2,
                            maxW: null,
                            minH: 2,
                            maxH: null,
                            id: item.id
                        });
                    } else if (graphs.includes(item.ks_dashboard_item_type)) {
                        self.grid.addWidget(ksPreview, {
                            x: 0, y: 0, w: 5, h: 5, autoPosition: true, minW: 4, maxW: null, minH: 3, maxH: null, id: item.id
                        });
                    } else {
                        self.grid.addWidget(ksPreview, {
                            x: 0, y: 0, w: 3, h: 2, autoPosition: true, minW: 2, maxW: null, minH: 2, maxH: 2, id: item.id
                        });
                    }
                }
            });

            this.grid.setStatic(true);
        }
    }

        const ks_element = this.main_body.el;
        Object.values(ks_element.querySelectorAll(".ks_dashboarditem_chart_container")).map((item) => { item.addEventListener('click', this.onkschartcontainerclick.bind(this))})
        Object.values(ks_element.querySelectorAll(".ks_dashboard_kpi_dashboard")).map((item) => { item.addEventListener('click', this.onkschartcontainerclick.bind(this))})
        document.querySelectorAll(".modal-body .ks_dashboard_item_button_container")?.forEach((element) => {
            element.remove();
        });

       document.getElementById('ks_ai_add_item')?.classList.add("d-none");
       document.querySelectorAll(".modal-header .btn-close")?.forEach((element) => {
            element.remove();
       });
        document.querySelectorAll(".modal-footer .o-default-button")?.forEach((element) => {
            element.remove();
       });

       let ks_footer = renderToElement("ks_ai_dashboard_footer", {
            self: this
       });
        document.querySelectorAll(".modal-footer").forEach((footer) => {
            footer.appendChild(ks_footer);
        });
    }


    getContext() {
        var self = this;
        var context = {
            ksDateFilterSelection: self.ksDateFilterSelection,
            ksDateFilterStartDate: self.ksDateFilterStartDate,
            ksDateFilterEndDate: self.ksDateFilterEndDate,
        }
        if(self.dn_state['user_context']['ksDateFilterSelection'] !== undefined && self.ksDateFilterSelection !== 'l_none'){
            context = self.dn_state['user_context']
        }
        var ks_new_obj = {...session.user_context,...{allowed_company_ids:this.env.services.company.activeCompanyIds}}
        return Object.assign(context, ks_new_obj);
    }

    ks_fetch_data(){
        var self = this;
        return rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_dashboard_data",{
            model: 'ks_dashboard_ninja.board',
            method: 'ks_fetch_dashboard_data',
            args: [self.ks_dashboard_id],
            kwargs : {context: self.getContext()},
        }).then(function(result) {
            self.ks_dashboard_data = result;
            self.ks_dashboard_data['ks_ai_dashboard'] = true
            if(self.dn_state['domain_data'] != undefined){
                self.ks_dashboard_data.ks_dashboard_domain_data=self.dn_state['domain_data']
                Object.values(self.ks_dashboard_data.ks_dashboard_pre_domain_filter).map((x)=>{
                    if(self.dn_state['domain_data'][x['model']] != undefined){
                        if(self.dn_state['domain_data'][x['model']]['ks_domain_index_data'][0]['label'].indexOf(x['name']) ==-1){
                            self.ks_dashboard_data.ks_dashboard_pre_domain_filter[x['id']].active = false;
                        }
                    }
                    else{
                        self.ks_dashboard_data.ks_dashboard_pre_domain_filter[x['id']].active = false;
                    }
                })
            }
        });
    }

    async dashboard_mount(){
        var self = this;
        var items = self.ksSortItems(self.ks_dashboard_data.ks_item_data)
        self.state.ks_dashboard_items = items
        self.ksRenderDashboard();

    }

    ks_fetch_items_data(){
        var self = this;
        var items_promises = []
        self.ks_dashboard_data.ks_dashboard_items_ids.forEach(function(item_id){
            items_promises.push(rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/ks_fetch_item",{
                model: "ks_dashboard_ninja.board",
                method: "ks_fetch_item",
                args : [[item_id], self.ks_dashboard_id, self.ksGetParamsForItemFetch(item_id)],
                kwargs:{context: self.getContext()}
            }).then(function(result){
                self.ks_dashboard_data.ks_item_data[item_id] = result[item_id];
            }));
        });
        self.state.ks_dash_name = self.ks_dashboard_data.name,
        self.state.ks_ai_dashboard = true,
        self.state.ks_dashboard_manager = self.ks_dashboard_data.ks_dashboard_manager,
        self.state.ks_dashboard_data = self.ks_dashboard_data,
        self.state.ks_dashboard_item_length = self.ks_dashboard_data.ks_dashboard_items_ids.length
        return Promise.all(items_promises)
    }

    ksGetParamsForItemFetch(){
        return {};
    }

    ksRenderDashboard(){
        var self = this;
        if (self.ks_dashboard_data.ks_child_boards) self.ks_dashboard_data.name = this.ks_dashboard_data.ks_child_boards[self.ks_dashboard_data.ks_selected_board_id][0];
        if (!isMobileOS()) {
            self.header.el?.classList.add("ks_dashboard_header_sticky");

        }
        if (Object.keys(self.ks_dashboard_data.ks_item_data).length===0){

             self.header?.el.querySelectorAll('.ks_dashboard_link').forEach((link) => {
                link.classList.add("d-none");
            });
             self.header?.el.querySelectorAll('.ks_dashboard_edit_layout').forEach((layout) => {
                layout.classList.add("d-none");
            });

        }
    }

    ksSortItems(ks_item_data) {
        var items = []
        var self = this;
        var item_data = Object.assign({}, ks_item_data);
        if (self.ks_dashboard_data.ks_gridstack_config) {
            self.gridstackConfig = JSON.parse(self.ks_dashboard_data.ks_gridstack_config);
            var a = Object.values(self.gridstackConfig);
            var b = Object.keys(self.gridstackConfig);
            for (var i = 0; i < a.length; i++) {
                a[i]['id'] = b[i];
            }
            a.sort(function(a, b) {
                return (35 * a.y + a.x) - (35 * b.y + b.x);
            });
            for (var i = 0; i < a.length; i++) {
                if (item_data[a[i]['id']]) {
                    items.push(item_data[a[i]['id']]);
                    delete item_data[a[i]['id']];
                }
            }
        }

        return items.concat(Object.values(item_data));
    }

    onKsDuplicateItemClick(e) {
        var self = this;
        var parentElement = e.target.closest('.ks_dashboarditem_id');
        var ks_item_id = parentElement.parentElement.id;
        var dashboard_id = parentElement.querySelector('.ks_dashboard_select').value;
        var dashboard_name = parentElement.querySelector('.ks_dashboard_select option:checked').textContent;
        rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/copy",{
            model: 'ks_dashboard_ninja.item',
            method: 'copy',
            args: [parseInt(ks_item_id), {
                'ks_dashboard_ninja_board_id': parseInt(dashboard_id)
            }],
            kwargs:{},
        }).then(function(result) {
            self.notification.add(_t('Selected item is duplicated to ' + dashboard_name + ' .'),{
                title:_t("Item Duplicated"),
                type: 'success',
            });
            self.actionService.doAction({
                type: "ir.actions.client",
                tag: "reload",
            });
        })
    }

    onkschartcontainerclick(ev){
            if(ev.currentTarget.classList.contains('ks_dashboard_kpi_dashboard')){
                if(!ev.currentTarget.querySelector('.select-btn').classList.contains('active')){
                    document.getElementById("ks_ai_add_item")?.classList.remove("d-none");
                    ev.currentTarget.querySelector('.select-btn')?.classList.add('active');
                    this.ksSelectedgraphid.push(parseInt(ev.currentTarget.parentElement.id));

                }else{
                   ev.currentTarget.querySelector('.select-btn').classList.remove("active");
                   const index = this.ksSelectedgraphid.indexOf(parseInt(ev.currentTarget?.parentElement.id));

                    this.ksSelectedgraphid.splice(index, 1);
                }
            }else{
                if(!ev.currentTarget.querySelector('.select-btn').classList.contains('active')){
                    document.getElementById("ks_ai_add_item")?.classList.remove("d-none");
                    ev.currentTarget.querySelector('.select-btn').classList.add('active');
                    this.ksSelectedgraphid.push(parseInt(ev.currentTarget.parentElement.id));
                }else{
                    ev.currentTarget.querySelector('.select-btn').classList.remove('active');
                    const index = this.ksSelectedgraphid.indexOf(parseInt(ev.currentTarget.parentElement.id));
                    this.ksSelectedgraphid.splice(index, 1);
                }
            }

            const selectedCount = this.ksSelectedgraphid.length;

            document.getElementById('selected_chart_count').textContent = selectedCount;

            if (this.ksSelectedgraphid.length == 0){

                document.getElementById("ks_ai_add_item")?.classList.add("d-none");
            }
        }

    onselectallitems(){
            this.ksSelectedgraphid = []
            document.querySelectorAll(".modal-body .ks_list_view_container").forEach((item) =>{

                item.querySelector('.select-btn').classList.add("active");
                this.ksSelectedgraphid.push(parseInt(item.parentElement.id))
            });
            document.querySelectorAll(".modal-body .ks_dashboard_kpi_dashboard").forEach((item) =>{

                item.querySelector('.select-btn').classList.add("active");
                this.ksSelectedgraphid.push(parseInt(item.parentElement.id))
            });

            document.querySelectorAll(".modal-body .ks_dashboarditem_chart_container").forEach((item) =>{

                item.querySelector('.select-btn').classList.add("active");
                this.ksSelectedgraphid.push(parseInt(item.parentElement.id))
            });


            document.getElementById('ks_ai_add_item').classList.remove('d-none');
            document.getElementById('ks_ai_remove_all_item').classList.remove('d-none');
            document.getElementById('ks_ai_add_all_item').classList.add('d-none');
            const selectedCount = this.ksSelectedgraphid.length;
            document.getElementById('selected_chart_count').textContent = selectedCount;
        }

    onremoveallitems(){

           document.querySelectorAll(".modal-body .ks_list_view_container").forEach((item) =>{
                item.querySelectorAll('.select-btn').forEach((btn) => {
                    btn.classList.remove("active");
                });
            })

            document.querySelectorAll(".modal-body .ks_dashboard_kpi_dashboard").forEach((item) =>{
                item.querySelectorAll('.select-btn').forEach((btn) => {
                    btn.classList.remove("active");
                });
            });

           document.querySelectorAll(".modal-body .ks_dashboarditem_chart_container").forEach((item) =>{
                item.querySelectorAll('.select-btn').forEach((btn) => {
                    btn.classList.remove("active");
                });
           });
            this.ksSelectedgraphid = [];
             document.getElementById("ks_ai_add_item").classList.add("d-none");
             document.getElementById("ks_ai_remove_all_item").classList.add("d-none");
             document.getElementById("ks_ai_add_all_item").classList.remove("d-none");
             document.getElementById("selected_chart_count").textContent = 0;

        }

    onKsaddItemClick(e) {
            var self = this;
            var dashboard_id = this.ks_ai_dash_id;
            var dashboard_name = this.ks_ai_dash_name;
            rpc("/web/dataset/call_kw/ks_dashboard_ninja.item/write",{
                model: 'ks_dashboard_ninja.item',
                method: 'write',
                args: [this.ksSelectedgraphid, {
                    'ks_dashboard_ninja_board_id': parseInt(dashboard_id)
                }],
                kwargs:{}
            }).then(function(result) {
                self.notification.add(_t('Items are added to ' + dashboard_name + ' .'),{
                    title:_t("Items added"),
                    type: 'success',
                });
                self.ks_fetch_data().then(function() {
                    self.onksaideletedash();
                });
            });
        }

    onksaideletedash(){
        var self= this;
        rpc("/web/dataset/call_kw/ks_dashboard_ninja.board/unlink",{
                model: 'ks_dashboard_ninja.board',
                method: 'unlink',
                args: [this.ks_ai_del_id],
                kwargs:{}
            }).then(function(result){
                 window.location.reload();
            });

        }
    speak_once(ev,item){
    }
}
KsAIDashboardNinja.components = { Ksdashboardtile,Ksdashboardgraph,Ksdashboardkpiview, Ksdashboardtodo, Dialog, FormViewDialog};
KsAIDashboardNinja.template = "ksaiDashboardNinjaHeader"
registry.category("actions").add("ks_ai_dashboard_ninja",KsAIDashboardNinja);
