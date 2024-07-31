const { Schema, model, Types } = require('mongoose');

const DOCUMENT_NAME = 'Discount';
const COLLECTION_NAME = 'discounts';
const discountSchema = new Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_code: { type: String, required: true },
    discount_type: { type: String, required: true, enum: ['percent', 'fixed'] },
    discount_value: { type: Number, required: true },
    discount_start_date: { type: Date, required: true },
    discount_end_date: { type: Date, required: true },
    discount_max_uses: { type: Number, required: true }, //số dùng voucher còn lại
    discount_uses_count: { type: Number, required: true, default: 0 }, //số lần đã dùng
    discount_max_use_per_user: { type: Number, required: true }, //số lần dùng tối đa cho 1 user
    discount_user_used: { type: Array, required: true, default: [] }, //danh sách user đã dùng
    discount_min_order_value: { type: Number, required: true }, //giá trị tối thiểu để sử dụng voucher
    discount_status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
    discount_apply: { type: String, required: true, enum: ['all', 'specific'], default: 'all' },
    discount_products: { type: Array, ref: 'Product', required: true, default: [] }, //danh sách sản phẩm áp dụng
    discount_shopId: { type: Types.ObjectId, ref: 'Shop', required: true } //id shop
  },
  { timestamps: true, collection: COLLECTION_NAME }
);
module.exports = model(DOCUMENT_NAME, discountSchema);
