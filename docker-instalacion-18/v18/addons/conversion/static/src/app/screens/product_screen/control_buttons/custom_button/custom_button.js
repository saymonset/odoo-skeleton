/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, useState } from "@odoo/owl";

export class CustomButton extends Component {
    static template = "pos_custom_button.CustomButton";
    static props = {};

    setup() {
        this.state = useState({ value: 1 });
    }

    increment() {
        this.state.value++;
    }

    async onClick() {
        console.log("Custom button.");
        this.increment();
    }
}
