const { default: mongoose, Types } = require('mongoose');

const DOCUMENT_NAME = 'Inventory';
const COLLECTION_NAME = 'inventories';
const inventorySchema = new mongoose.Schema(
  {
    inven_productId: { type: Types.ObjectId, ref: 'Product', required: true },
    inven_shopId: { type: Types.ObjectId, ref: 'Shop', required: true },
    inven_stock: { type: Number, required: true },
    inven_location: { type: String, default: 'unknown' },
    inven_reservation: { type: Array, default: [] }
    /**
     * [
     * {cartId,stock,createOn}
     * ]
     */
  },
  { timestamps: true, collection: COLLECTION_NAME }
);
module.exports = mongoose.model(DOCUMENT_NAME, inventorySchema);
