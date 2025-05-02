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

       // debugger
        // Verifica si el método de pago es IGTF y aplica el 30%
        if (paymentMethod.name.toUpperCase() === 'IGTF') {
          debugger
           // Obtén el valor del IGTF desde la base de datos
           const env = useEnv();
           const { rpc } = env.services;
          // Obtén la última línea de pago
          const paymentLines = this.paymentLines;
          if (paymentLines.length > 0) {
              const lastLine = paymentLines[paymentLines.length - 1];
              
              // Calcula el 30% del monto original
              const igtf = 30; // Asegúrate de que IGTF esté definido en tu configuración
             // const additionalAmount = (igtf / 100) * Math.abs(lastLine.amount);
             
              
              // Ajusta el monto de la última línea de pago
              paymentMethod.name = paymentMethod.name + ` (${igtf}%)`;
              lastLine.amount = ((igtf / 100) * lastLine.amount ) * -1 // Update the value of the last element
             // lastLine.amount = lastLine.amount - additionalAmount;
          }
      }

    //  return result;
    },

     
     
});
