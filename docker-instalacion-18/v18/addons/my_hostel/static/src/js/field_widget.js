/** @odoo-module */

import { Component, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { renderToElement } from "@web/core/utils/render";

export class CategColorField extends Component {
    setup() {
        this.totalColors = [1,2,3,4,5,6];
        super.setup();
    }
    clickPill(value) {
        this.props.record.update({ [this.props.name]: value });
    }
    categInfo(ev) {
        const target = ev.target;
        const data = target.dataset; // Using dataset to get data attributes
        const categInfoPanel = target.parentElement.querySelector(".categInformationPanel");

        // Render the CategInformation component and set the inner HTML
        categInfoPanel.innerHTML = renderToElement("CategInformation", {
            value: data.value,
            widget: this
        }).outerHTML; // Convert the rendered element to HTML string
    }
}
CategColorField.template = "CategColorField";
CategColorField.supportedTypes = ["integer"];
registry.category("fields").add("category_color", {
    component: CategColorField,
});

