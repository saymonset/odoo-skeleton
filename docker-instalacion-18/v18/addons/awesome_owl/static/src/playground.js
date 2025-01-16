/** @odoo-module **/

import { Component,  useState } from "@odoo/owl";
import { Counter } from './counter/counter'
import { Navbar } from './webclient/navbar'
import { TodoList } from './todoo/todo_list'

export class Playground extends Component {
    static template = "awesome_owl.playground";
    static components = { Counter, Navbar, TodoList };
    state = useState({ a: "fromparent", valueParent:0 });


    getValueFromChild(value) {
        console.log('Hola desde el padre');
        this.state.valueParent = value;
      }
}
