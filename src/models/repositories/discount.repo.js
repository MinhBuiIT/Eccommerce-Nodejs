const { handleSelectConfig } = require('../../utils');
const discountModel = require('../discount.model');

const findOneDiscount = async (filter) => {
  return await discountModel.findOne(filter).lean();
};
const findProductByDiscount = async ({ discountId, limit, page }) => {
  return await discountModel
    .findById(discountId)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('discount_products')
    .populate('discount_products', 'product_name product_thumb')
    .lean();
};
const findDiscountByShop = async ({ shopId, limit, page, unSelect }) => {
  return await discountModel
    .find({ discount_shopId: shopId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(handleSelectConfig(unSelect, 0))
    .lean();
};
module.exports = { findOneDiscount, findProductByDiscount, findDiscountByShop };
