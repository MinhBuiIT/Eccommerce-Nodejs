const { CreatedResponse, OKResponse } = require('../core/success.response');
const CartService = require('../services/cart.services');

class CartController {
  async addToCart(req, res, next) {
    const result = await CartService.addToCart(req.body);
    new CreatedResponse({ message: 'Add To Cart Success', metadata: result }).send(res);
  }
  async updateAmountProductCart(req, res, next) {
    const result = await CartService.updateQuatityProductInCart(req.body);
    new OKResponse({ message: 'Update Product In Cart Success', metadata: result }).send(res);
  }
  async getProductInCart(req, res, next) {
    const result = await CartService.listProductInCart({ userId: req.query.userId });
    new OKResponse({ message: 'Get Products In Cart Success', metadata: result }).send(res);
  }
  async deleteProductItemInCart(req, res, next) {
    const result = await CartService.deleteItemInCart(req.body);
    new OKResponse({ message: 'Delete Product In Cart Success', metadata: result }).send(res);
  }
  async deleteAllProductInCart(req, res, next) {
    const result = await CartService.emptyCart(req.body);
    new OKResponse({ message: 'Delete All Product In Cart Success', metadata: result }).send(res);
  }
}
module.exports = new CartController();
