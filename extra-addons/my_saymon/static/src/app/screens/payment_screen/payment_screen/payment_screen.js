/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useEnv, useState } from "@odoo/owl";
import {  paymentService } from "@my_saymon/app/screens/conversion_service";

// Guarda una referencia al método original
const originalAddNewPaymentLine = PaymentScreen.prototype.addNewPaymentLine;

patch(PaymentScreen.prototype, {
    /**
     * Sobrescribimos el método para agregar un manejador de clic personalizado.
     */
    addNewPaymentLine(paymentMethod) {
     //   debugger
        // const env = useEnv();
        // this.conversionService =  useState(env.conversionService);
        // this.conversionService.setPaymentMethodName(paymentMethod.name);
        
        // Imprime el nombre del método de pago seleccionado en la consola
        console.log(`Método de pago seleccionado: ${paymentMethod.name}`);
          // Guarda el nombre del método de pago en el servicio
          paymentService.setPaymentMethodName(paymentMethod.name);

        // Llama al método original para que continúe con su funcionalidad
        originalAddNewPaymentLine.call(this, paymentMethod);
    },

     
     
});
