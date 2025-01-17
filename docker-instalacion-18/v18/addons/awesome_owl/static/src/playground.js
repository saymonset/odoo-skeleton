/** @odoo-module **/

import { Component,  useState } from "@odoo/owl";
import { Counter } from './counter/counter'
import { Navbar } from './webclient/navbar'
import { Todoo } from './todoo/todoo'

export class Playground extends Component {
    static template = "awesome_owl.playground";
    static components = { Counter, Navbar, Todoo };
    state = useState({ a: "fromparent", valueParent:0 });


    getValueFromChild(value) {
        console.log('Hola desde el padre');
        this.state.valueParent = value;
      }
}
