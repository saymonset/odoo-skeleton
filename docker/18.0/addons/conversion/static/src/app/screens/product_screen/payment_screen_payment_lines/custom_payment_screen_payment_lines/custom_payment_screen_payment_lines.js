/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered , onWillUpdateProps, onWillStart, useRef } from "@odoo/owl";
 
 
export class CustomPaymentScreenPaymentLines extends Component {
    static template = "conversion.CustomPaymentScreenPaymentLines";
     // Definir las propiedades que recibirá el componente
     static components = {
       
    };
   // Define las propiedades que el componente espera recibir
   static props = {
        paymentLines: Array, // Asegúrate de que el tipo sea correcto
    };

    setup() {
        
        super.setup();
        
          console.log("********Payment lines recibidas:", this.props.paymentLines);

        onRendered(() => {
        });
        onWillUpdateProps((nextProps) => {
            console.log("******************Props actualizadas:", nextProps);
        });  
    }
    calculateAmountSaymon(line) {
        // Lógica personalizada para calcular el campo en el frontend (si es necesario)
        return line.get_amount() / 60; // Ejemplo: multiplicar por 1.5
    }
    // Sobrescribe el método addNewPaymentLine
    async onClick() {
        console.log("Lineas...Custom button paymentScreen.");
    }
}
