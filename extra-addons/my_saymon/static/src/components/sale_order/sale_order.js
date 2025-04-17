/** @odoo-module **/
odoo.define('my_saymon.Sale_order', function (require) {
  "use strict";

  const FormController = require('web.FormController');
  const rpc = require('web.rpc');

  FormController.include({
      _onFieldChanged: function (event) {
          this._super.apply(this, arguments);
          if (event.data.changes.pricelist_id) {
              const orderId = this.model.get(this.handle).data.id;
              const pricelistId = event.data.changes.pricelist_id;
              rpc.query({
                  route: '/sale_order/update_pricelist',
                  params: {
                      order_id: orderId,
                      pricelist_id: pricelistId,
                  },
              }).then(function (result) {
                  if (result.success) {
                      console.log(result.message);
                  } else {
                      console.error(result.message);
                  }
              });
          }
      },
  });
});
