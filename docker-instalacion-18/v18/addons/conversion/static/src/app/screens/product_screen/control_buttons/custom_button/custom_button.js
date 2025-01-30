/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, useState, onWillStart , onWillUpdateProps, useRef, useService } from "@odoo/owl";
import { TagsList } from "@web/core/tags_list/tags_list";
//import { useService } from "@odoo/owl"; // Importar el servicio

export class CustomButton extends Component {
    static template = "conversion.CustomButton";
     // Definir las propiedades que recibirá el componente
     static props = {
        line: Object, // Asegúrate de que la propiedad 'line' sea un objeto
    };
    static components = { TagsList };

    setup() {
        this.state = useState({ value: 1, price: this.props.line.price, currencyRate: 1, rate :1, ref:0 });
        //   // Obtener el tipo de cambio
        this.getCurrencyRate(this.props.line.currency_id).then(rate => {
            this.state.rate = rate;
            console.log("Currency Rate:", this.state.currencyRate);
        });
   
        this.loadLastConversion().then((ref)=>{
                this.state.ref = ref;
            });;
     
        //this.loadLastConversion();
     
        super.setup();
       
    }

    async loadLastConversion() {
        var self = this;
        var resModel = 'conversion.conversion'; // Nombre del modelo
        var domain = []; // Sin filtros, para obtener todos los registros
        var fields = ['id', 'name', 'dateCurrency', 'currency_id', 'rent_amount']; // Campos que deseas recuperar
        var order = 'id desc'; // Ordenar por ID en orden descendente para obtener el último registro
    
        // Realizar la consulta al modelo
    const lastRecord = await self.env.services.orm.searchRead(
            resModel,
            domain,
            fields,
            { limit: 1, order: order } // Limitar a 1 registro y ordenar por ID descendente
        );
    
        // Verificar si se obtuvo un registro
        if (lastRecord.length > 0) {
            console.log('Último registro:', lastRecord[0]);
          
            return lastRecord[0].rent_amount; // Retornar el último registro
        } else {
            console.log('No se encontraron registros.');
           
            return null; // No hay registros
        }
    }
 
    async getCurrencyRate(currencyId) {
        var self = this;
        // Usar el ORM para obtener el tipo de cambio
        const result = await self.env.services.orm.searchRead('res.currency.rate', [['currency_id', '=', 1]], ['rate'], { limit: 1 });
        return result.length > 0 ? result[0].rate : 7; // Retornar el tipo de cambio o 1 si no se encuentra
    }

    increment() {
        this.state.value++;
    }

    async onClick() {
        console.log("Custom button.");
        console.log("Current line:", this.props.line); // Aquí puedes acceder a la línea actual
        this.increment();
    }
}
