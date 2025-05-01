/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
//import  from 'point_of_sale.PaymentScreenMethods';
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";


// Guarda una referencia al método original
const originalAddNewPaymentLine = PaymentScreen.prototype.addNewPaymentLine;

patch(PaymentScreen.prototype, {
    /**
     * Sobrescribimos el método para agregar un manejador de clic personalizado.
     */
    addNewPaymentLine(paymentMethod) {
        // Imprime el nombre del método de pago seleccionado en la consola
        console.log(`Método de pago seleccionado: ${paymentMethod.name}`);

        // Llama al método original para que continúe con su funcionalidad
        originalAddNewPaymentLine.call(this, paymentMethod);
    },
});
