/** @odoo-module **/

import { Component,  useState } from "@odoo/owl";
import { Counter } from './counter/counter'

export class Playground extends Component {
    static template = "awesome_owl.playground";
    static components = { Counter };
    state = useState({ a: "fromparent", valueParent:0 });


    callback(value) {
        console.log('Hola desde el padre');
        this.state.valueParent = value;
      }
}
