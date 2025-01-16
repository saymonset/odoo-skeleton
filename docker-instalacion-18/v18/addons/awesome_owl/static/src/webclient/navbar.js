/** @odoo-module **/

import { Component } from "@odoo/owl";

export class Navbar extends Component {
  static template = "awesome_owl.Navbar";
  static props = {
    currentApp: String,
  }

}
