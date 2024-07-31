'use strict';

const { CreatedResponse, OKResponse } = require('../core/success.response');
const AccessService = require('../services/access.services');

class AccessController {
  signUp = async (req, res, next) => {
    const result = await AccessService.signUp(req.body);
    new CreatedResponse({ message: 'Registed Success', metadata: result.metadata }).send(res);
  };
  login = async (req, res, next) => {
    const result = await AccessService.login(req.body);
    new OKResponse({ message: 'Login Success', metadata: result }).send(res);
  };
  logout = async (req, res, next) => {
    const result = await AccessService.logout(req.keyShop.user_id);
    new OKResponse({ message: 'Logout Success', metadata: result }).send(res);
  };
  refreshToken = async (req, res, next) => {
    const result = await AccessService.handlerRefreshTokenV2(req.refresh_token, req.keyShop, req.user);
    new OKResponse({ message: 'Refresh Token Success', metadata: result }).send(res);
  };
}
module.exports = new AccessController();
