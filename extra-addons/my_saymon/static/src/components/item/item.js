/** @odoo-module **/

import { Component } from "@odoo/owl";
import {registry } from '@web/core/registry'

export class Item extends Component {
    static template = "my_saymon.Item";
    static components = {};
    static props = {};

    setup() {}
}
registry.category('public_components').add('my_saymon.Item', Item)
