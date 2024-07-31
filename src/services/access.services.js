'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const shopModel = require('../models/shop.model');
const { saveKey } = require('./key.services');
const { createTokenAuth } = require('../auth/authUtils');
const { getInfoObejct } = require('../utils');
const { BadRequest, Unauthorized } = require('../core/error.response');
const createKey = require('../auth/createKey');
const ShopService = require('./shop.services');
const keyModel = require('../models/key.model');
const KeyService = require('./key.services');
const ROLE_SHOP = {
  SHOP: '0001',
  WRITER: '0002',
  EDITOR: '0003',
  ADMIN: '0004'
};
class AccessService {
  static async handlerRefreshTokenV2(refresh_token, keyShop, user) {
    //Kiểm tra refresh token đã được sử dụng chưa
    const RTUsed = keyShop.refreshTokenUsed;
    const { user_id, email, exp } = user;
    //Nếu đã sử dụng
    if (RTUsed.includes(refresh_token)) {
      await KeyService.deleteKeyByUserId(user_id);
      throw new Unauthorized('Something went wrong. Please login again');
    }
    //Nếu chưa sử dụng Tốt
    if (refresh_token !== keyShop.refreshToken) {
      throw new Unauthorized('Refresh token is invalid');
    }

    //verify
    const shopAuth = await ShopService.findOneShop({ _id: user_id });
    if (!shopAuth) {
      throw new Unauthorized('Shop not registered');
    }
    //Tạo access token mới va refresh token mới với expiried time giống refresh token cũ
    const tokens = await createTokenAuth({
      payload: { user_id, email },
      privateKey: keyShop.privateKey,
      publicKey: keyShop.publicKey,
      exp: exp
    });
    //update holderRT và thêm refresh token cũ vào mảng refreshTokenUsed
    await keyShop.updateOne({
      $set: { refreshToken: tokens.refresh_token },
      $addToSet: { refreshTokenUsed: refresh_token } //thêm vào mảng nếu chưa tồn tại
    });
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }
  static async handlerRefreshToken(refresh_token) {
    //Kiểm tra refresh token đã được sử dụng chưa
    const foundRefreskTokenUsed = await KeyService.findRTUsed(refresh_token);
    //Nếu đã sử dụng
    if (foundRefreskTokenUsed) {
      const { user_id } = jwt.verify(refresh_token, foundRefreskTokenUsed.publicKey);
      await KeyService.deleteKeyByUserId(user_id);
      throw new Unauthorized('Something went wrong. Please login again');
    }
    //Nếu chưa sử dụng Tốt
    const holderRT = await KeyService.findRT(refresh_token);
    if (!holderRT) {
      throw new Unauthorized('Refresh token is invalid');
    }
    //verify
    const { user_id, email, exp } = jwt.verify(refresh_token, holderRT.publicKey);
    const shopAuth = await ShopService.findOneShop({ _id: user_id });
    if (!shopAuth) {
      throw new Unauthorized('Shop not registered');
    }
    //Tạo access token mới va refresh token mới với expiried time giống refresh token cũ
    const tokens = await createTokenAuth({
      payload: { user_id, email },
      privateKey: holderRT.privateKey,
      publicKey: holderRT.publicKey,
      exp: exp
    });
    //update holderRT và thêm refresh token cũ vào mảng refreshTokenUsed
    await holderRT.updateOne({
      $set: { refreshToken: tokens.refresh_token },
      $addToSet: { refreshTokenUsed: refresh_token } //thêm vào mảng nếu chưa tồn tại
    });
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }

  static async logout(user_id) {
    //Xóa key
    const result = await keyModel.deleteOne({ user_id });
    return result;
  }
  static async login({ email, password }) {
    //Tìm kiếm shop đã đăng ký chưa
    const shopAuth = await ShopService.findOneShop({ email }, '_id name email password role');
    if (!shopAuth) {
      throw new Unauthorized('Shop not found');
    }
    const isMatch = await bcrypt.compare(password, shopAuth.password);
    if (!isMatch) {
      throw new Unauthorized('Email or password is incorrect');
    }
    //Tạo key
    const { publicKey, privateKey } = createKey();
    //Tạo token
    const tokens = await createTokenAuth({
      payload: { user_id: shopAuth._id, email: shopAuth.email },
      privateKey,
      publicKey
    });
    //Lưu vào db
    const keys = await saveKey(shopAuth._id, publicKey, privateKey, tokens.refresh_token);
    if (!keys) {
      throw new BadRequest('Keys Error');
    }
    //Trả về token
    return {
      shop: getInfoObejct(shopAuth, ['_id', 'name', 'email', 'role']),
      tokens: tokens
    };
  }

  static async signUp({ name, email, password }) {
    //Tìm kiếm shop đã đăng ký chưa (lean để trả về dạng object và hiệu quả hơn find)
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequest('Shop already registered');
    }
    //Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    //Tạo mới shop
    const newShop = await shopModel.create({ name, email, password: hashPassword, role: [ROLE_SHOP.SHOP] });
    //Tạo key
    if (newShop) {
      //privateKey: khóa riêng, publicKey: khóa công khai => Buffer
      /*const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
          }
        });
        => RSA: bất đối xứng
        */
      const { publicKey, privateKey } = createKey();
      //Tạo token
      const tokens = await createTokenAuth({
        payload: { user_id: newShop._id, email: newShop.email },
        privateKey: privateKey,
        publicKey: publicKey
      });
      //Lưu public key vào database
      const keys = await saveKey(newShop._id, publicKey, privateKey, tokens.refresh_token);
      if (!keys) {
        throw new BadRequest('Keys Error');
      }

      return {
        code: 201,
        metadata: {
          shop: getInfoObejct(newShop, ['_id', 'name', 'email', 'role']),
          tokens: tokens
        }
      };
    }
    return {
      code: 201,
      metadata: null
    };
  }
}
module.exports = AccessService;
