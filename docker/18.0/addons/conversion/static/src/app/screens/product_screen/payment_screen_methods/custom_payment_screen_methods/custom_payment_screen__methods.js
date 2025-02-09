/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered , onWillUpdateProps, onWillStart, useRef } from "@odoo/owl";
import { TagsList } from "@web/core/tags_list/tags_list";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { TextInputPopup } from "@point_of_sale/app/utils/input_popups/text_input_popup";
import { useService } from "@web/core/utils/hooks";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { parseFloat } from "@web/views/fields/parsers";
import { useErrorHandlers, useAsyncLockedMethod } from "@point_of_sale/app/utils/hooks";
import { registry } from "@web/core/registry";

import { AlertDialog, ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { NumberPopup } from "@point_of_sale/app/utils/input_popups/number_popup";
import { DatePickerPopup } from "@point_of_sale/app/utils/date_picker_popup/date_picker_popup";
import { ConnectionLostError, RPCError } from "@web/core/network/rpc";

import { PaymentScreenPaymentLines } from "@point_of_sale/app/screens/payment_screen/payment_lines/payment_lines";
import { PaymentScreenStatus } from "@point_of_sale/app/screens/payment_screen/payment_status/payment_status";
import { Numpad, enhancedButtons } from "@point_of_sale/app/generic_components/numpad/numpad";
import { floatIsZero, roundPrecision } from "@web/core/utils/numbers";
import { ask } from "@point_of_sale/app/store/make_awaitable_dialog";
import { handleRPCError } from "@point_of_sale/app/errors/error_handlers";
import { sprintf } from "@web/core/utils/strings";
import { serializeDateTime } from "@web/core/l10n/dates";
export class CustomPaymentScreenMethods extends PaymentScreen {
    static template = "conversion.CustomPaymentScreenMethods";
     // Definir las propiedades que recibirá el componente
     static components = {
        Numpad,
        PaymentScreenPaymentLines,
        PaymentScreenStatus,
    };
    static props = {
        //orderUuid: String,
    };

    setup() {
        super.setup();
        this.pos = usePos();

        this.ui = useState(useService("ui"));
        this.dialog = useService("dialog");
        this.invoiceService = useService("account_move");
        this.notification = useService("notification");
        this.hardwareProxy = useService("hardware_proxy");
        this.printer = useService("printer");
        this.payment_methods_from_config = this.pos.config.payment_method_ids
            .slice()
            .sort((a, b) => a.sequence - b.sequence);
        this.numberBuffer = useService("number_buffer");
        this.numberBuffer.use(this._getNumberBufferConfig);
        useErrorHandlers();
        this.payment_interface = null;
        this.error = false;
        this.validateOrder = useAsyncLockedMethod(this.validateOrder);
        if (!this.pos) {
            console.error("El entorno POS que p[asqa] no está inicializado.");
            return;
        }
        console.log("Estado POS inicializado correctamente:", this.pos);
        //this.pos = this.env.pos;
     
        this.dialog = useService("dialog");

        onRendered(() => {
            if (!this.pos) {
                console.error("El entorno POS no está disponible en onRendered.");
                return;
            }
            // Obtén el pedido actual
            const currentOrder = this.pos.get_order();
            if (!currentOrder) {
                console.error("No se pudo obtener el pedido actual.");
                return;
            }

            const amountDue = currentOrder.getDefaultAmountDueToPayIn();
            console.log("Resultado del método sobrescrito:", amountDue);
        });
        

        
        onWillUpdateProps((nextProps) => {
            console.log("Props actualizadas:", nextProps);
        });  

    }

    get currentOrderzz() {
        return this.pos.models["pos.order"].getBy("uuid", this.props.orderUuid);
    }

    addNewPaymentLine(paymentMethod) {

        if (!this.pos) {
            console.error("El entorno POS que p[asqa] no está inicializado.");
            return;
        }
         const currentOrder = this.pos?.get_order(); // Obtén el pedido actual
    
        if (!currentOrder) {
            console.error("El pedido actual no está definido.");
            return;
        }

        if (typeof currentOrder.get_last_paymentline !== "function") {
            console.error("El método get_last_paymentline no está definido en currentOrder.");
            console.log("currentOrder:", currentOrder);
            return;
        }
    
        const paymentLine = currentOrder.get_last_paymentline();
        if (paymentLine) {
            // Multiplica la cantidad por 2
            paymentLine.set_amount(paymentLine.amount * 2);
            console.log(`Cantidad actualizada: ${paymentLine.amount}`);
        } else {
            console.error("No se pudo obtener la línea de pago.");
        }
    }
    // Sobrescribe el método addNewPaymentLine
  
    async onClick() {
        console.log("Custom button paymentScreen.");
        const payload = await this.openTextInput('saymon and saymon');
        console.log({payload})
    }


    async openTextInput(selectedNote) {
        let buttons = [];
        return await makeAwaitable(this.dialog, TextInputPopup, {
            title: _t("Add %s", "Bienvenido saymons"),
            buttons,
            rows: 4,
            startingValue: selectedNote,
        });
    }
}
