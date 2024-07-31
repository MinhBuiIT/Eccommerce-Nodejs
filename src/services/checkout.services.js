const { NotFound, BadRequest } = require('../core/error.response');
const inventoryModel = require('../models/inventory.model');
const orderModel = require('../models/order.model');
const { findOneCart } = require('../models/repositories/cart.repo');
const { checkProductsValid } = require('../models/repositories/checkout.repo');
const { backupInventory } = require('../models/repositories/inventory.repo');
const CartService = require('./cart.services');
const { getAmountDiscountProduct } = require('./discount.services');
const { acquiredKey, deleteKey } = require('./redis.services');

class CheckoutService {
  /**
   * {
   *  userId,
   *  cartId,
   *  shop_order_ids: [
   *  {
   *      shopId,
   *      shop_discounts: [],
   *      items_product: [
   *          {
   *              productId,
   *              quantity,
   *              price
   *          }
   *      ]
   * },
   * {
   *      shopId,
   *      shop_discounts: [{discount_code,discount_id}],
   *      items_product: [
   *          {
   *              productId,
   *              quantity,
   *              price
   *          }
   *      ]
   * }
   *
   * ]
   * }
   *
   */

  static async createCheckout({ userId, cartId, shop_order_ids, isOrder = false }) {
    const foundCart = await findOneCart({ _id: cartId, cart_userId: userId });
    if (!foundCart) {
      throw new NotFound('Cart not found');
    }
    const shop_order_ids_new = [];
    const checkoutTotal = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalPayment: 0
    };
    for (let i = 0; i < shop_order_ids.length; i++) {
      const checkoutShop = shop_order_ids[i];
      //check những product có hợp lệ không
      const itemsProduct = await checkProductsValid(checkoutShop.items_product);
      if (itemsProduct.some((product) => !product)) {
        throw new NotFound('Product not found');
      }
      //tính tổng giá sản phẩm khi chưa giảm giá
      const totalProduct = itemsProduct.reduce(
        (total, product) => total + product.product_price * product.product_count,
        0
      );
      checkoutTotal.totalPrice += totalProduct;
      const itemOrderShopNew = {
        shopId: checkoutShop.shopId,
        shop_discounts: checkoutShop.shop_discounts,
        items_product: itemsProduct,
        priceRaw: totalProduct,
        priceAfterDiscount: totalProduct
      };
      if (checkoutShop.shop_discounts.length > 0) {
        //Giả sử mỗi đơn hàng của một shop chỉ áp dụng 1 mã giảm giá
        const discount = checkoutShop.shop_discounts[0];
        const { price_final, price_decrease } = await getAmountDiscountProduct({
          discountCode: discount.discount_code,
          shopId: checkoutShop.shopId,
          userId,
          products: itemsProduct,
          isOrder
        });
        checkoutTotal.totalDiscount += price_decrease;
        itemOrderShopNew.priceAfterDiscount = price_final;
      }
      checkoutTotal.totalPayment += itemOrderShopNew.priceAfterDiscount;
      shop_order_ids_new.push(itemOrderShopNew);
    }
    return {
      shop_order_ids,
      shop_order_ids_new,
      stats_checkout: checkoutTotal
    };
  }
  static async orderPayment({ userId, cartId, shop_order_ids, address = {}, payment = {} }) {
    const { shop_order_ids_new, stats_checkout } = await CheckoutService.createCheckout({
      userId,
      cartId,
      shop_order_ids,
      isOrder: true
    });
    const order_success = [];
    const products = shop_order_ids_new.flatMap((order) => order.items_product);
    // console.log('products:::', products);
    for (let i = 0; i < products.length; i++) {
      const { _id: productId, product_count: quantity } = products[i];
      const key = await acquiredKey(productId, quantity, cartId);
      // console.log('Key:::', key);
      //Kiểm tra nếu có product nào không có trong inventory thì cập nhật trong order_success
      order_success.push(key ? true : false);
      if (key) deleteKey(key);
    }
    if (order_success.includes(false)) {
      //Phục hồi dữ liệu các hàng hóa khi có một hàng hóa hết stock trong kho
      const indexSuccessProduct = order_success
        .map((item, index) => {
          if (item) {
            return index;
          }
          return undefined;
        })
        .filter((item) => item);
      for (let i = 0; i < products.length; i++) {
        if (indexSuccessProduct.includes(i)) {
          const { _id: productId, product_count: quantity } = products[i];
          await backupInventory({ productId, cartId, quantity });
        }
      }
      // const productsBackup = await inventoryModel.find({inven_reservation: })
      throw new BadRequest('Hàng hóa thay đổi vui lòng quay về giỏ hàng để kiểm tra');
    }
    //Tạo đơn hàng
    const newOrder = await orderModel.create({
      order_userId: userId,
      order_checkout: stats_checkout,
      order_payment: payment,
      order_shipping: address,
      order_products: shop_order_ids_new
    });
    //xóa product trong cart
    await Promise.all(
      products.map(async (product) => {
        const { _id: productId } = product;
        return await CartService.deleteItemInCart({ userId, productId });
      })
    );
    return newOrder;
  }
}
module.exports = CheckoutService;
