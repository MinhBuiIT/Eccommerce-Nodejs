const { converStringToObjectId } = require('../../utils');
const CartModel = require('../cart.model');

const findOneCart = async (filter = {}) => {
  return await CartModel.findOne(filter);
};
const findProductInCart = async ({ userId }) => {
  return await CartModel.find({ cart_userId: userId }).select('cart_products');
};
module.exports = { findOneCart, findProductInCart };
