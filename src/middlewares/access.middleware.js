const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const HEADER = require('../constants/header.constant');
const { Forbidden } = require('../core/error.response');
const KeyService = require('../services/key.services');
const catchError = require('../utils/catchError');

const authenticateHanlder = catchError(async (req, res, next) => {
  const user_id = req.headers[HEADER.CLIENT_ID];
  if (!user_id) {
    throw new Forbidden('Client Id is required');
  }
  const keyShop = await KeyService.findKey({ user_id: new mongoose.Types.ObjectId(user_id) });
  if (!keyShop) {
    throw new Forbidden('Client Id is invalid');
  }
  const authorization = req.headers[HEADER.AUTHORIZATION];
  if (!authorization || !authorization.includes('Bearer')) {
    throw new Forbidden('Authorization is invalid');
  }
  const access_token = authorization.split(' ')[1];
  try {
    const decode = jwt.verify(access_token, keyShop.privateKey);
    req.keyShop = keyShop;
    next();
  } catch (error) {
    throw new Forbidden(error.message);
  }
});
const authenticateHanlderV2 = catchError(async (req, res, next) => {
  const user_id = req.headers[HEADER.CLIENT_ID];
  if (!user_id) {
    throw new Forbidden('Client Id is required');
  }
  const keyShop = await KeyService.findKey({ user_id: new mongoose.Types.ObjectId(user_id) });
  if (!keyShop) {
    throw new Forbidden('Not found key shop');
  }

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    const refresh_token = req.headers[HEADER.REFRESH_TOKEN];
    try {
      const decoded = jwt.verify(refresh_token, keyShop.publicKey);
      req.user = decoded;
      req.refresh_token = refresh_token;
      req.keyShop = keyShop;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        //khi refresh token hết hạn, xóa refresh token khỏi key shop
        await KeyService.deleteKeyByUserId(user_id);
        throw new Forbidden('Refresh token is expired');
      }
      throw new Forbidden(error.message);
    }
  }
  const authorization = req.headers[HEADER.AUTHORIZATION];
  if (!authorization || !authorization.includes('Bearer')) {
    throw new Forbidden('Authorization is invalid');
  }
  const access_token = authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(access_token, keyShop.privateKey);
    req.user = decoded;
    req.keyShop = keyShop;
    next();
  } catch (error) {
    throw new Forbidden(error.message);
  }
});
module.exports = { authenticateHanlder, authenticateHanlderV2 };
