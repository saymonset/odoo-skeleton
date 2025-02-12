/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered , onWillUpdateProps, onWillStart, useRef } from "@odoo/owl";
 
 
export class CustomPaymentScreenMethods extends Component {
    static template = "conversion.CustomPaymentScreenMethods";
     // Definir las propiedades que recibirá el componente
     static components = {
       
    };
    static props = {
        //orderUuid: String,
    };

    setup() {
        super.setup();
       
        onRendered(() => {
       
        });
        

        
        onWillUpdateProps((nextProps) => {
            console.log("Props actualizadas:", nextProps);
        });  

    }
 
    
    // Sobrescribe el método addNewPaymentLine
  
    async onClick() {
        console.log("Custom button paymentScreen.");
    
    }


}
