'use strict';
const shopModel = require('../models/shop.model');

class ShopService {
  static async findOneShop(filter = {}, select = ' _id name email role status ') {
    const result = await shopModel.findOne(filter, select).lean();
    return result;
  }
}
module.exports = ShopService;
