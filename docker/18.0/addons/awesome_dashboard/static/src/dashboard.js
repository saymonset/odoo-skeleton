/** @odoo-module **/

import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    setup() {
        this.action = useService("action");
        this.sharedState = useService("shared_state");
        this.sharedState.setValue("somekey","saymon and saymon")
        const value = this.sharedState.getValue("somekey");
        console.log('--------------------------------1------------------------------')
        console.log({value})
        console.log('--------------------------------2------------------------------')
        // do something with value
     }

    openSettings() {
        this.action.doAction("base_setup.action_general_configuration");
     }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
