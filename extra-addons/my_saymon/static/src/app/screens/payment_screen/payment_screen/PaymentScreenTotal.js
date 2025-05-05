/** @odoo-module **/
import { patch } from "@web/core/utils/patch"; 
import { CustomPaymenScreen } from "@my_saymon/app/screens/payment_screen/payment_screen/custom_payment_screen/custom_payment_screen";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
patch(PaymentScreen, {
    components: {
        ...PaymentScreen.components,
        CustomPaymenScreen,
    },
    setup() {
        this._super(); // Call the original setup method
     
    },
    });