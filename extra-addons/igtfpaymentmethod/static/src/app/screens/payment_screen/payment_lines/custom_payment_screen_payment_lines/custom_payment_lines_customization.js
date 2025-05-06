/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered, onWillUpdateProps, useRef } from "@odoo/owl";
import {  paymentService } from "@igtfpaymentmethod/app/screens/conversion_service";

export class CustomPaymentLinesCustomization extends Component {
    static template = "igtfpaymentmethod.Custom_payment_lines_customization";
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
      //  
        super.setup();
   
        const hasData = this.props.paymentLines && this.props.paymentLines.length > 0;
      //  const paymentMethodName = paymentService.getPaymentMethodName();
        this.state = useState({
            result: 0,
            hasData,
            inputValue: 0,
            selectedCurrency: "USD",
            paymentMethodName: paymentService.getPaymentMethodName(),
            is_igtf: paymentService.is_igtf,
        });

        console.log("********Payment lines recibidas:", this.props.paymentLines || []);

       

        onRendered(() => {
            if (this.props.paymentLines && this.props.paymentLines.length > 0) {
                this.updateHasData(this.props.paymentLines);
            }
            this.state.paymentMethodName = paymentService.getPaymentMethodName();
            this.state.is_igtf = paymentService.is_igtf;
        });

        onWillUpdateProps((nextProps) => {
            if (nextProps.paymentLines) {
                this.updateHasData(nextProps.paymentLines);
            } else {
                console.warn("No se recibieron nuevas líneas de pago.");
            }

            // Escuchar cambios en el nombre del método de pago
        const newPaymentMethodName = paymentService.getPaymentMethodName();
        if (newPaymentMethodName !== this.state.paymentMethodName) {
            this.state.paymentMethodName = newPaymentMethodName; // Actualiza el estado
            this.state.is_igtf = paymentService.is_igtf; // Actualiza el estado
           // this.updateLastPaymentLine(this.state.result); // Llama a updateLastPaymentLine si ha cambiado
        }
        });
    }



 

updateLastPaymentLine(newValue) {
    if (this.props.paymentLines && this.props.paymentLines.length > 0) {
        const lastLine = this.props.paymentLines[this.props.paymentLines.length - 1];
        //Secaldula el igtf
     //   
        if (this.state.is_igtf) {
          //  lastLine.amount = ((igtf / 100) * lastLine.amount ) * -1 // Update the value of the last element
        }else{
            lastLine.amount = newValue; // Update the value of the last element
        }
        console.log("Última línea actualizada:", lastLine);
    } else {
        console.warn("No payment lines available to update.");
    }
}
   
  // Método sobrescrito para eliminar una línea y actualizar el estado
  deleteLineWithStateUpdate(uuid) {
    console.log('Llamando a deleteLine con UUID:', uuid);

    // Verifica si deleteLine está definido antes de llamarlo
   // if (typeof this.props.deleteLine === "function") {
     //   this.props.deleteLine(uuid); // Llama al método original

        // Actualiza el estado de hasData
        const hasData = this.props.paymentLines && this.props.paymentLines.length > 0;
        this.state.hasData = hasData;
    // } else {
    //     console.error("deleteLine no está definido en las propiedades del componente.");
    // }
}
    updateHasData(paymentLines = this.props.paymentLines || []) {
        this.state.hasData = paymentLines.length > 0;
        if (!this.state.hasData) {
            this.state.result = 0;
        }
    }

    // Otros métodos de tu clase...
}
