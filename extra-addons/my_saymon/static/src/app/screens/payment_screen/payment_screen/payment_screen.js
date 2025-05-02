/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { useEnv, useState, onMounted } from "@odoo/owl";
import {  paymentService } from "@my_saymon/app/screens/conversion_service";

// Guarda una referencia al método original
const originalAddNewPaymentLine = PaymentScreen.prototype.addNewPaymentLine;

patch(PaymentScreen.prototype, {
  setup() {
    super.setup(...arguments);
   // debugger
    // Llama a setup del componente original
    const env = useEnv();
    this.igtfValue = 0; // Inicializa el valor del IGTF

    // Obtén el valor del IGTF desde la base de datos
    const { rpc } = env.services;

    onMounted(() => {
        // const pendingPaymentLine = this.currentOrder.payment_ids.find(
        //     (paymentLine) =>
        //         paymentLine.payment_method_id.use_payment_terminal === "adyen" &&
        //         !paymentLine.is_done() &&
        //         paymentLine.get_payment_status() !== "pending"
        // );
        // if (!pendingPaymentLine) {
        //     return;
        // }
        // pendingPaymentLine.payment_method_id.payment_terminal.set_most_recent_service_id(
        //     pendingPaymentLine.terminalServiceId
        // );
    });
},
    
    /**
     * Sobrescribimos el método para agregar un manejador de clic personalizado.
     */
   async addNewPaymentLine(paymentMethod) {
        // Calcula el 30% del monto original
       // let igtf = 0; // Asegúrate de que IGTF esté definido en tu configuración
        // Imprimir toda la información del método de pago
         console.log('Método de Pago Completo:', paymentMethod);
         console.log('Propiedades del Método de Pago:', Object.keys(paymentMethod));

        // // Verificar si is_igtf existe
        // if (paymentMethod.is_igtf !== undefined) {
        //     console.log('Es IGTF:', paymentMethod.is_igtf);
        //     console.log('Porcentaje IGTF:', paymentMethod.igtf_percentage);
        // } else {
        //     console.warn('El campo is_igtf no está presente en el método de pago');
        // }
        // // Verifica si el método de pago es IGTF
        // if (paymentMethod.is_igtf) {
        //   igtf = paymentMethod.igtf_percentage || 0; 
        // }
        
        // Imprime el nombre del método de pago seleccionado en la consola
        console.log(`Método de pago seleccionado: ${paymentMethod.name}`);
          // Guarda el nombre del método de pago en el servicio
        paymentService.setPaymentMethodName(paymentMethod.name);

        // Llama al método original para que continúe con su funcionalidad
        originalAddNewPaymentLine.call(this, paymentMethod);

        debugger
        // Verifica si el método de pago es IGTF y aplica el 30%
        if (paymentMethod.is_igtf) {
           // Obtén el valor del IGTF desde la base de datos
          //  const env = useEnv();
          //  const { rpc } = env.services;
          // Obtén la última línea de pago
          const paymentLines = this.paymentLines;
          if (paymentLines.length > 0) {
              const lastLine = paymentLines[paymentLines.length - 1];
              // Ajusta el monto de la última línea de pago
              paymentMethod.name = paymentMethod.name + ` (${paymentMethod.igtf_percentage}%)`;
              lastLine.amount = (( paymentMethod.igtf_percentage / 100) * lastLine.amount ) * -1 // Update the value of the last element
          }
      }

    //  return result;
    },

     
     
});
