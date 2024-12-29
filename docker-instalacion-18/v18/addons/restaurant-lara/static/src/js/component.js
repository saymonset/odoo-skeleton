/** @odoo-module **/
import { Component, mount, xml, whenReady } from "@odoo/owl";
odoo.define('restaurant-lara.component', [], function (require) {
    "use strict";

    console.log("Load component......");
   
    class MyComponent extends Component {
        static template = xml`
            <div class="bg-info text-white text-center p-3">
                <b> Welcome To RESTAURANT-LARAXX</b>
                <i class="fa fa-close p-1 float-end"
                    style="cursor: pointer;"
                    t-on-click="onRemove"> </i>
            </div>`
            onRemove(ev) {
                ev.target.closest("div").remove(); // Elimina el contenedor del componente
            }
    }
    whenReady().then(() => {
        mount(MyComponent, document.body);
    });

});
