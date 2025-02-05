/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered , onWillUpdateProps, onWillStart, useRef, useService } from "@odoo/owl";
import { TagsList } from "@web/core/tags_list/tags_list";
import { formatMonetary } from "@web/views/fields/formatters";
export class CustomPaymentScreen extends Component {
    static template = "conversion.CustomPaymentScreen";
     // Definir las propiedades que recibirá el componente
     static props = {
    };
    static components = { TagsList };

    setup() {
        onRendered(() => {
           console.log('paymentScreen entrando.....')
        }); 
        onWillUpdateProps((nextProps) => {
            console.log("Props actualizadas:", nextProps);
        });  
        super.setup();
    }
    async onClick() {
        console.log("Custom button paymentScreen.");
    }
}
