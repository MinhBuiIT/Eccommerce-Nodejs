const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Cart';
const COLLECTION_NAME = 'carts';
const cartSchema = new Schema(
  {
    cart_state: { type: String, required: true, enum: ['active', 'pending', 'completed', 'failed'], default: 'active' },
    cart_userId: { type: String, required: true },
    cart_products: [
      {
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        shop_id: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        product_quantity: { type: Number, required: true },
        product_price: { type: Number, required: true },
        product_name: { type: String, required: true }
      }
    ],
    cart_count_product: { type: Number, required: true }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const CartModel = model(DOCUMENT_NAME, cartSchema);
module.exports = CartModel;
