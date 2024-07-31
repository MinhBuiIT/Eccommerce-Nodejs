const redis = require('redis');
const { orderInventory } = require('../models/repositories/inventory.repo');
// const {promisify} = require('util')

const redisClient = redis.createClient();
redisClient.connect().then(() => {
  console.log('Connect Redis!');
});

// const pexpire = promisify(redisClient.pExpire).bind(redisClient)
// const setnx = promisify(redisClient.setNX).bind(redisClient)
const acquiredKey = async (productId, quantity, cartId) => {
  const key = `key_product_${productId}`;
  const retryAgain = 10; //số lần thử lại
  const expiredTime = 3000; //thời gian hết hạn key
  for (let i = 1; i <= retryAgain; i++) {
    //set key
    //Khi có nhiều req đặt cùng một hàng thì nó sẽ thực hiện theo atomic cho từng đơn hàng
    const result = await redisClient.setNX(key, `${expiredTime}`);
    if (result) {
      //Thực hiện update trong inventory
      const updateInventory = await orderInventory({ productId, quantity, cartId });
      //nếu update thành công tức là có để sản phẩm trong kho
      await redisClient.pExpire(key, expiredTime);
      if (updateInventory.modifiedCount) {
        return key;
      }
      return null;
    } else {
      //Đặt khoảng thời gian thử sau mỗi retry là 500ms
      await new Promise(() => setTimeout(() => {}, 500));
    }
  }
};
const deleteKey = async (key) => {
  return await redisClient.del(key);
};
module.exports = { deleteKey, acquiredKey };
