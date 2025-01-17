/** @odoo-module */

import { Component } from "@odoo/owl";

export class Layout extends Component {
  static template = "awesome_owl.Layout";
  static props = {
    slots: Object,
    contentClass: { type: String, optional: true },
  };
}
