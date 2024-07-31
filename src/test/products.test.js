const redisPubSubServices = require('../services/redisPubSub.services');

class ProductTest {
  static async orderPro() {
    const order = {
      name: 'Product 1',
      price: 100
    };
    await redisPubSubServices.publish('order_product', order);
  }
}
module.exports = ProductTest;
