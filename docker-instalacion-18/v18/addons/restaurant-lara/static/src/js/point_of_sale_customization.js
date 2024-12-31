/** @odoo-module **/
import { Component } from "@odoo/owl";
import { ProductScreen } from  "@point_of_sale/app/screens/product_screen/product_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { patch } from "@web/core/utils/patch";

// Definir el botón de descuento
export class PosDiscountButton extends Component {
    static template = "PosDiscountButton";

    setup() {
      //  this.pos = usePos();
    }

    async onClick() {
        alert('Eres una bestia!')
        // const order = this.pos.get_order();
        // if (order.selected_orderline) {
        //     order.selecbted_orderline.set_discount(5);
        // }
    }
}



// Parchear ControlButtons para agregar el botón de descuento
patch(ControlButtons.prototype, {
    async onClick() {
         // Create an instance of PosDiscountButton
         const discountButton = new PosDiscountButton();
         await discountButton.onClick(); // Call the onClick method of the discount button

    
      
    },
});

// Parchear ControlButtons para agregar el botón de descuento


 
patch(ControlButtons.prototype, {
    async onClickPopup() {
        this.dialog.add(AlertDialog, {
            title: _t("Custom Alert saymon "),
            body: _t("Choose the alert type Sonnyra"),
        });
      
    },
});
