const mongoose = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'order';
// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema(
  {
    order_userId: { type: String },
    order_checkout: { type: Object, default: {} },
    /**
     * {
     totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalPayment: 0
     * }
     */
    order_products: { type: Object, default: {} },
    /**
     shop_order_ids_new
     */
    order_shipping: { type: Object, default: {} },
    order_payment: { type: Object, default: {} },
    order_trackingNumber: { type: String, default: '#001118072024' },
    order_status: { type: String, enum: ['pending', 'confirm', 'delivered', 'cancel'], default: 'pending' }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
