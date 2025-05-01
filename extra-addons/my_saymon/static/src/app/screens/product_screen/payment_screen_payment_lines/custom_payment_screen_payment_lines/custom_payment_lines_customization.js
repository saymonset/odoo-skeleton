/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered, onWillUpdateProps, useRef } from "@odoo/owl";
import { CONFIG } from "@my_saymon/config";


export class CustomPaymentLinesCustomization extends Component {
    static template = "my_saymon.Custom_payment_lines_customization";
    static components = {};
    
    static props = {
        paymentLines: {
            type: Array,
            optional: true
        },
        order: {
            type: Object,
            optional: true,
            shape: {
                payment_ids: Array
            }
        },
        deleteLine: {
            type: Function,
            optional: true,
        },
    };

    setup() {
      //  debugger
        super.setup();
    
      
        this.numberInputRef = useRef("numberInput");
        const hasData = this.props.paymentLines && this.props.paymentLines.length > 0;
        this.state = useState({
            result: 0,
            hasData,
            inputValue: 0,
            ref_label: CONFIG.REF_LABEL,
            selectedCurrency: "USD",
        });

        console.log("********Payment lines recibidas:", this.props.paymentLines || []);

        onRendered(() => {
            if (this.props.paymentLines && this.props.paymentLines.length > 0) {
                this.updateHasData(this.props.paymentLines);
            }
        });

        onWillUpdateProps((nextProps) => {
            if (nextProps.paymentLines) {
                this.updateHasData(nextProps.paymentLines);
            } else {
                console.warn("No se recibieron nuevas líneas de pago.");
            }
        });
    }

   
    updateHasData(paymentLines = this.props.paymentLines || []) {
        this.state.hasData = paymentLines.length > 0;
        if (!this.state.hasData) {
            this.state.result = 0;
        }
    }

    // Otros métodos de tu clase...
}
