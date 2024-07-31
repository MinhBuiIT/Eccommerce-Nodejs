const redisPubSubServices = require('../services/redisPubSub.services');

class InventoryTest {
  constructor() {
    redisPubSubServices.subcribe('order_product', (message) => {
      InventoryTest.updateInventory(message);
    });
  }
  static updateInventory(order) {
    console.log(`Updating inventory for ${order}`);
  }
}

module.exports = new InventoryTest();
