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
  listeners: [], // Array para almacenar los listeners

  setPaymentMethodName(name) {
      this.paymentMethodName = name;
      this.notifyListeners(); // Notifica a los listeners cuando cambia el nombre
  },

  getPaymentMethodName() {
      return this.paymentMethodName;
  },

  // Método para agregar listeners
  addListener(callback) {
      this.listeners.push(callback);
  },

  // Método para notificar a todos los listeners
  notifyListeners() {
      this.listeners.forEach(callback => callback(this.paymentMethodName));
  }
};
  