const { BadRequest, NotFound } = require('../core/error.response');
const CartModel = require('../models/cart.model');
const { ProductModel } = require('../models/product.model');
const { findOneCart, findProductInCart } = require('../models/repositories/cart.repo');
const { findOneProduct } = require('../models/repositories/product.repo');
const { converStringToObjectId } = require('../utils');

/**
 * Add to cart [User]: Khi chưa có giỏ hàng thì tạo mới giỏ hàng. Khi có giỏ hàng mà không có sản phẩm thì thêm mới vào sản phẩm. Khi có sản phẩm thì cập nhật số lượng sản phẩm.
 *
 */
class CartService {
  static async createCart({ userId, product }) {
    return await CartModel.create({
      cart_userId: converStringToObjectId(userId),
      cart_products: [product],
      cart_count_product: 1
    });
  }
  static async updateCart({ userId, product }) {
    const query = {
      cart_userId: userId,
      cart_state: 'active',
      cart_products: { $elemMatch: { product_id: converStringToObjectId(product.product_id) } }
    };
    const update = {
      $inc: {
        'cart_products.$.product_quantity': product.product_quantity
      }
    };
    const cartUpdate = await CartModel.findOneAndUpdate(query, update, { new: true });
    return cartUpdate;
  }
  static async addToCart({ userId, product }) {
    const foundCart = await findOneCart({ cart_userId: userId });
    if (!foundCart) {
      // Nếu chưa có giỏ hàng thì tạo mới giỏ hàng
      const newCart = await CartModel.create({
        cart_userId: userId,
        cart_products: [product],
        cart_count_product: 1
      });
      return newCart;
    }
    if (foundCart && foundCart.cart_state !== 'active') {
      throw new BadRequest('Cart not active');
    }
    const findProductInCart = foundCart.cart_products.findIndex(
      (item) => item.product_id.toString() === product.product_id
    );
    //Nếu có giỏ hàng mà giỏ hàng rỗng thì thêm vào hoặc Nếu có giỏ hàng và sản phẩm nhưng ko có sản phẩm thêm vào
    if (foundCart.cart_products.length === 0 || findProductInCart === -1) {
      foundCart.cart_products.unshift(product);
      foundCart.cart_count_product += 1;
      await foundCart.save();
      return foundCart;
    }
    return await CartService.updateCart({ userId, product });
  }
  /**
   * shop_order_ids: [
   *    {
   *        shopId,
   *        item_products: [{
   *            quantity,
   *            old_quantity,
   *            name,
   *            price,
   *            product_id
   *        }],
   *        version
   *    }
   * ]
   *
   */

  static async updateQuatityProductInCart({ userId, shop_order_ids }) {
    const { shopId, item_products } = shop_order_ids[0];
    const { product_id, name, price, quantity, old_quantity } = item_products[0];
    const foundProduct = await ProductModel.findOne({
      product_shop: converStringToObjectId(shopId),
      _id: converStringToObjectId(product_id)
    });
    if (!foundProduct) {
      throw new NotFound('Product Not Found');
    }
    if (name !== foundProduct.product_name || +price !== +foundProduct.product_price) {
      throw new BadRequest('Data Product Invalid');
    }
    //Kiểm tra nếu quantity = 0 thì xóa sản phẩm khỏi
    const product_quantity = quantity - old_quantity;
    if (product_quantity === 0) {
      return await CartService.deleteItemInCart({ userId, productId: product_id });
    }
    return await CartService.updateCart({ userId, product: { product_id, product_quantity } });
  }
  //Xóa item trong cart
  static async deleteItemInCart({ userId, productId }) {
    const foundCart = await findOneCart({ cart_userId: userId, cart_state: 'active' });
    if (!foundCart) {
      throw new NotFound('Cart Not Found');
    }
    const indexProduct = foundCart.cart_products.findIndex((pro) => pro.product_id.toString() === productId);
    if (indexProduct === -1) {
      throw new BadRequest('Product in cart Not Found');
    }
    foundCart.cart_products.splice(indexProduct, 1);
    await foundCart.save();
    return foundCart;
  }
  static async listProductInCart({ userId }) {
    return await findProductInCart({ userId });
  }
  //Làm rỗng giỏ hàng
  static async emptyCart({ userId }) {
    const foundCart = await findOneCart({ cart_userId: userId, cart_state: 'active' });
    if (!foundCart) {
      throw new NotFound('Cart Not Found');
    }
    foundCart.cart_products = [];
    foundCart.cart_count_product = 0;
    await foundCart.save();
    return foundCart;
  }
}

module.exports = CartService;
