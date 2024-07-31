const redisPubSubServices = require('../services/redisPubSub.services');

class Inventory2Test {
  constructor() {
    redisPubSubServices.subcribe('order_product', (message) => {
      Inventory2Test.updateInventory(message);
    });
  }
  static updateInventory(order) {
    console.log(`Updating inventory 2 for ${order}`);
  }
}

module.exports = new Inventory2Test();
