'use strict';
const keyModel = require('../models/key.model');

class KeyService {
  static async saveKey(id, publicKey, privateKey, refreshToken) {
    // const result = await keyModel.create({ user_id: id, publicKey, privateKey });
    // return result ? { publicKey: result.publicKey, privateKey: result.privateKey } : null;
    const result = await keyModel.findOneAndUpdate(
      { user_id: id },
      { publicKey, privateKey, refreshToken, refreshTokenUsed: [] },
      { upsert: true, new: true }
    );
    return result ? { publicKey: result.publicKey, privateKey: result.privateKey } : null;
  }
  static async findKey(filter = {}) {
    const result = await keyModel.findOne(filter);
    return result;
  }
  static async findRTUsed(refresh_token) {
    const result = await keyModel.findOne({ refreshTokenUsed: refresh_token }).lean();
    return result;
  }
  static async findRT(refresh_token) {
    const result = await keyModel.findOne({ refreshToken: refresh_token });
    return result;
  }
  static async deleteKeyByUserId(user_id) {
    const result = await keyModel.deleteOne({ user_id });
    return result;
  }
}
module.exports = KeyService;
