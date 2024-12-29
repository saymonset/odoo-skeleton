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
        this.pos = usePos();
    }

    async onClick() {
        const order = this.pos.get_order();
        if (order.selected_orderline) {
            order.selecbted_orderline.set_discount(5);
        }
    }
}


// ProductScreen.addControlButton({
//     component: PosDiscountButton,
//     condition: function () {
//         return true;
//     },
// });


// Parchear el componente ControlButtons para agregar el nuevo botón
// patch(ControlButtons.prototype, "CustomControlButtons", {
//     setup() {
//         this._super(); // Llama al método original
//         this.controlButtons.push({
//             component: PosDiscountButton,
//             condition: () => true, // Puedes agregar condiciones específicas si es necesario
//         });
//     },
// });

patch(ControlButtons.prototype, {
    async onClickPopup() {
        this.dialog.add(AlertDialog, {
            title: _t("Custom Alert saymon "),
            body: _t("Choose the alert type Sonnyra"),
        });
      
    },
});
