/** @odoo-module */
  // paymentService.js
export const paymentService = {
  paymentMethodName: '',
  _is_igtf: false,
  
  get is_igtf() {
    return this._is_igtf;
  },
  set is_igtf(value) {
    this._is_igtf = value;
  },
   
  setPaymentMethodName(name) {
      this.paymentMethodName = name;
  },

  getPaymentMethodName() {
      return this.paymentMethodName;
  },
};
  