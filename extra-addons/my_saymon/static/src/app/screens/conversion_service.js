/** @odoo-module */

import { useEnv, useState } from "@odoo/owl";

export class ConversionService {
  constructor() {
    this.paymentMethod = ''
  }

  setPaymentMethodName(name) {
    this.paymentMethod = name;
  }

  getPaymentMethodName() {
    return this.paymentMethod = name;
  }
}


export function useConversionService() {
    const env = useEnv();
    return useState(env.conversionService);
  }

  // paymentService.js
export const paymentService = {
  paymentMethodName: '',
  
  setPaymentMethodName(name) {
      this.paymentMethodName = name;
  },

  getPaymentMethodName() {
      return this.paymentMethodName;
  }
};
  