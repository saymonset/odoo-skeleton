/** @odoo-module **/
import { PaymentScreenPaymentLines } from "@point_of_sale/app/screens/payment_screen/payment_lines/payment_lines";
import { patch } from "@web/core/utils/patch"; 
import {CustomPaymentLinesCustomization} from './custom_payment_screen_payment_lines/custom_payment_lines_customization'
patch(PaymentScreenPaymentLines, {
    components: {
        ...PaymentScreenPaymentLines.components,
           CustomPaymentLinesCustomization,
    },
    setup() {
        this._super(); // Call the original setup method
        // Define el método deleteLineWithStateUpdate
        // this.deleteLineWithStateUpdate = (uuid) => {
        //     console.log("Llamando a deleteLineWithStateUpdate con UUID:", uuid);

        //     // Llama al método original deleteLine si está disponible
        //     if (typeof this.props.deleteLine === "function") {
        //         this.props.deleteLine(uuid);
        //     } else {
        //         console.error("deleteLine no está definido en las propiedades del componente padre.");
        //     }
        // };
    },
    });