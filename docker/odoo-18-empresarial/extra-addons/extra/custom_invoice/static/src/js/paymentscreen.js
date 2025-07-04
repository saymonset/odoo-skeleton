import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { CDFIDetailPopupWidget } from "@custom_invoice/js/add_info_popup";
import { makeAwaitable } from "@point_of_sale/app/store/make_awaitable_dialog";
import { patch } from "@web/core/utils/patch";
import { rpc } from "@web/core/network/rpc";
import { ConnectionLostError, RPCError } from "@web/core/network/rpc";
import { serializeDateTime } from "@web/core/l10n/dates";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.isMxEdiPopupOpen = false;
    },
    //@override
    async toggleIsToInvoice() {
        if (this.pos.company.country_id?.code === "MX" && !this.currentOrder.is_to_invoice()) {
            const payload = await makeAwaitable(this.dialog, CDFIDetailPopupWidget, {
                order: this.currentOrder,
            });
            if (payload) {
                this.currentOrder.uso_cfdi = payload.uso_cfdi;
            } else {
                this.currentOrder.set_to_invoice(!this.currentOrder.is_to_invoice());
            }
        }
        super.toggleIsToInvoice(...arguments);
    },
    areMxFieldsVisible() {
        return this.pos.company.country_id?.code === "MX" && this.currentOrder.is_to_invoice();
    },

    async _finalizeValidation() {
        var order = this.env.services.pos.get_order();
        if (this.currentOrder.is_paid_with_cash() || this.currentOrder.get_change()) {
            this.hardwareProxy.openCashbox();
        }

        this.currentOrder.date_order = serializeDateTime(luxon.DateTime.now());
        for (const line of this.paymentLines) {
            if (!line.amount === 0) {
                this.currentOrder.remove_paymentline(line);
            }
        }

        this.pos.addPendingOrder([this.currentOrder.id]);
        this.currentOrder.state = "paid";

        this.env.services.ui.block();
        let syncOrderResult;
        try {
            // 1. Save order to server.
            syncOrderResult = await this.pos.syncAllOrders({ throw: true });
            if (!syncOrderResult) {
                return;
            }

            // 2. Invoice.
            if (this.shouldDownloadInvoice() && this.currentOrder.is_to_invoice()) {
                if (this.currentOrder.raw.account_move) {
                    await this.invoiceService.downloadPdf(this.currentOrder.raw.account_move);

                    await rpc(`/web/dataset/call_kw/pos.order/get_invoice_information`,{
                        model: 'pos.order',
                        method: 'get_invoice_information',
                        args: [this.currentOrder.raw.account_move, order.pos_session_id, order.sequence_number],
                        kwargs: {},
                    }).then((result) => {
                        order.invoice_information = result;
                    });
                } else {
                    throw {
                        code: 401,
                        message: "Backend Invoice",
                        data: { order: this.currentOrder },
                    };
                }
            }
        } catch (error) {
            if (error instanceof ConnectionLostError) {
                this.pos.showScreen(this.nextScreen);
                Promise.reject(error);
            } else if (error instanceof RPCError) {
                this.currentOrder.state = "draft";
                handleRPCError(error, this.dialog);
            } else {
                throw error;
            }
            return error;
        } finally {
            this.env.services.ui.unblock();
        }

        // 3. Post process.
        const postPushOrders = syncOrderResult.filter((order) => order.wait_for_push_order());
        if (postPushOrders.length > 0) {
            await this.postPushOrderResolve(postPushOrders.map((order) => order.id));
        }

        await this.afterOrderValidation(!!syncOrderResult && syncOrderResult.length > 0);
    }
});
