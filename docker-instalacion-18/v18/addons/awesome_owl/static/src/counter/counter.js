/** @odoo-module **/

import { Component,  useState } from "@odoo/owl";

export class Counter extends Component {
    static template = "awesome_owl.counter";
    static props = {
        a: String,
        b: String,
        callback: Function,
      };
    setup() {
        this.state = useState({ value: 0 });
    }

    increment() {
        this.state.value++;
    }
}
