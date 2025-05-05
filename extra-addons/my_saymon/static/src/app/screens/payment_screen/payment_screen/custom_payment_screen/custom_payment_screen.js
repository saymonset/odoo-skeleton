/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered, onWillUpdateProps,onWillStart } from "@odoo/owl";
import { CONFIG } from "@my_saymon/config";
import { convertCurrency } from "@my_saymon/currencyConverter"; 

export class CustomPaymenScreen extends Component {
    static template = "my_saymon.custom_payment_screen";
    static components = {};
    
    static props = {
        currentOrder: {
            type: Object,
            optional: true,
        },
        paymentLines: {
            type: Array, // Cambia a Array si paymentLines es un array
            optional: true,
        },
       
    };

    setup() {
      //  
        super.setup();
        
        
        this.state = useState({
            totalDue: this.props.currentOrder ? this.props.currentOrder.getTotalDue() || 0 : 0,
            paymentLines: this.props.paymentLines || [],
            usd: 0,
            ref:'USD',
        });

        onWillStart(async () => {
            if (this.state.totalDue) {
                const usd = await convertCurrency(this.state.totalDue, 'VEF', 'USD');
                this.state.usd = usd ;
            }
        });
        
    }

    get formattedAmount() {
        return `${this.state.usd.toFixed(2)} ${this.state.ref}`;
    }
 
}
