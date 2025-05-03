/** @odoo-module */
  // paymentService.js
export const paymentService = {
  paymentMethodName: '',
   
  setPaymentMethodName(name) {
      this.paymentMethodName = name;
  },

  getPaymentMethodName() {
      return this.paymentMethodName;
  },
};
  