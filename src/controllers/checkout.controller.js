const { CreatedResponse, OKResponse } = require('../core/success.response');
const CheckoutService = require('../services/checkout.services');

class CheckoutController {
  async createCheckout(req, res, next) {
    const result = await CheckoutService.createCheckout(req.body);
    new CreatedResponse({ message: 'Checkout successfully', metadata: result }).send(res);
  }
  async orderProduct(req, res, next) {
    const result = await CheckoutService.orderPayment(req.body);
    new OKResponse({ message: 'Checkout successfully', metadata: result }).send(res);
  }
}
module.exports = new CheckoutController();
