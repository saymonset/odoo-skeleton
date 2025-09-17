import {FormController} from "@web/views/form/form_controller";
import {KanbanController} from "@web/views/kanban/kanban_controller";
import {onWillUnmount} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";

patch(KanbanController.prototype, {
    async openRecord(record, mode) {
        if (
            record.resModel === "vertical.lift.shuttle" &&
            this.props.className.includes("open_shuttle_screen")
        ) {
            const ormService = this.env.services.orm;
            const action = await ormService.call(
                "vertical.lift.shuttle",
                "action_open_screen",
                [record.resId]
            );
            this.actionService.doAction(action);
        } else {
            super.openRecord(record, mode);
        }
    },
});

patch(FormController.prototype, {
    setup() {
        super.setup();
        this.busService = useService("bus_service");
        if (this.props.resModel.startsWith("vertical.lift.operation.")) {
            this.busService.addChannel("notify_vertical_lift_screen");
            this.busService.addEventListener("notification", (notifications) => {
                notifications.forEach(([channel, message]) => {
                    if (
                        channel === "notify_vertical_lift_screen" &&
                        message.action === "refresh"
                    ) {
                        this.vlift_bus_action_refresh(message.params);
                    }
                });
            });
        }

        onWillUnmount(() => {
            this.busService.deleteChannel("notify_vertical_lift_screen");
        });
    },

    vlift_bus_action_refresh(params) {
        if (params.id === this.props.resId && params.model === this.props.resModel) {
            this.model.root.load();
        }
    },
});
