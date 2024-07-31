'use strict';
const { OKResponse, CreatedResponse } = require('../core/success.response');
const DiscountService = require('../services/discount.services');

class DiscountController {
  async createDiscount(req, res, next) {
    const shopId = req.user.user_id;
    const result = await DiscountService.createDiscount(req.body, shopId);
    new CreatedResponse({ message: 'Create discount success', metadata: result }).send(res);
  }
  async updateDiscount(req, res, next) {
    const id = req.params.id;
    const payload = req.body;
    const result = await DiscountService.updateDiscount({ id, payload });
    new OKResponse({ message: 'Update discount success', metadata: result }).send(res);
  }
  async getProductByDiscount(req, res, next) {
    const discountCode = req.params.code;
    const shopId = req.user.user_id;
    const result = await DiscountService.getAllProductsByDiscountCode({
      code: discountCode,
      shopId,
      limit: req.query.limit,
      page: req.query.page || 1
    });
    new OKResponse({ message: 'Get product by discount success', metadata: result }).send(res);
  }
  async getAllDiscountsByShop(req, res, next) {
    const shopId = req.user.user_id;
    const result = await DiscountService.getAllDiscountsByShop({
      shopId,
      limit: req.query.limit,
      page: req.query.page || 1
    });
    new OKResponse({ message: 'Get all discount success', metadata: result }).send(res);
  }
  async getAmountDiscountProduct(req, res, next) {
    const { discount_code, shop_id, user_id, products } = req.body;
    const result = await DiscountService.getAmountDiscountProduct({
      discountCode: discount_code,
      shopId: shop_id,
      userId: user_id,
      products
    });
    new OKResponse({ message: 'Get amount discount success', metadata: result }).send(res);
  }
  async cancleDiscountUser(req, res, next) {
    const { discount_code, shop_id, user_id } = req.body;
    await DiscountService.cancelDiscount({
      code: discount_code,
      shopId: shop_id,
      userId: user_id
    });
    new OKResponse({ message: 'Cancle discount user success', metadata: true }).send(res);
  }
  async deleteDiscount(req, res, next) {
    const code = req.params.code;
    const shopId = req.user.user_id;
    await DiscountService.deleteDiscount({ code, shopId });
    new OKResponse({ message: 'Delete discount success', metadata: true }).send(res);
  }
}

module.exports = new DiscountController();
