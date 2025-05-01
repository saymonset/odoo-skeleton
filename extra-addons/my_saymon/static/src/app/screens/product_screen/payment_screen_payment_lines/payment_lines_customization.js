/** @odoo-module **/
import { PaymentScreenPaymentLines } from "@point_of_sale/app/screens/payment_screen/payment_lines/payment_lines";
import { patch } from "@web/core/utils/patch"; 
import { Component, useState, useSubEnv } from "@odoo/owl";
import {  ConversionService } from "@my_saymon/app/screens/conversion_service";
import {CustomPaymentLinesCustomization} from './custom_payment_screen_payment_lines/custom_payment_lines_customization'

patch(PaymentScreenPaymentLines, {
    components: {
        ...PaymentScreenPaymentLines.components,
           CustomPaymentLinesCustomization,
    },
    setup() {
        this._super(); // Call the original setup method
        const conversionService = useState(new ConversionService());
        // add store to environment
        useSubEnv({ conversionService });
     
    },
    });