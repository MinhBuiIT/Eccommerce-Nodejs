'use strict';
const apiKeysModel = require('../models/apiKeys.model');
const crypto = require('crypto');

class ApiKeyService {
  static async findApiKey(key) {
    // const keysRandom = crypto.randomBytes(64).toString('hex');
    // await apiKeysModel.create({ key: keysRandom, status: true, permissions: ['1111'] });
    const apiKey = await apiKeysModel.findOne({ key }).lean();
    return apiKey;
  }
}
module.exports = ApiKeyService;
