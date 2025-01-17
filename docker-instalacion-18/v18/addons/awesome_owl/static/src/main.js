import { whenReady, mount } from "@odoo/owl";
import { mountComponent } from "@web/env";
import { Playground } from "./playground";
import { WebClient } from "./webclient/web_client";
import { templates } from "@web/core/assets";

const config = {
    templates,
    dev: true,
    name: "Owl Tutorial",
};

// Mount the Playground component when the document.body is ready
whenReady(() => mountComponent(WebClient, document.body, config));
