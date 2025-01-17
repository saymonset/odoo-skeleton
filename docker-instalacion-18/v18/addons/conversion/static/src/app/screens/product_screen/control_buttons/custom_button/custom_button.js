/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, useState } from "@odoo/owl";
import { TagsList } from "@web/core/tags_list/tags_list";
//import { useService } from "@odoo/owl"; // Importar el servicio
import { useService } from "@odoo/owl"; // Importar el servicio

export class CustomButton extends Component {
    static template = "conversion.CustomButton";
     // Definir las propiedades que recibirá el componente
     static props = {
        line: Object, // Asegúrate de que la propiedad 'line' sea un objeto
    };
    static components = { TagsList };

    setup() {
        super.setup();
        this.state = useState({ value: 1, price: this.props.line.price, currencyRate: 1, rate :1 });
         
        //   // Obtener el tipo de cambio
        this.getCurrencyRate(this.props.line.currency_id).then(rate => {
            this.state.rate = rate;
            console.log("Currency Rate:", this.state.currencyRate);
        });
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
