const HEADER = require('../constants/header.constant');
const { Forbidden } = require('../core/error.response');
const ApiKeyService = require('../services/apiKey.services');

//x-api-key = ....

const apiKey = async (req, res, next) => {
  const apiKeyReq = req.headers[HEADER.API_KEY];
  if (!apiKeyReq) return next(new Forbidden());
  //tìm api key trong db
  const apiKeyDb = await ApiKeyService.findApiKey(apiKeyReq);
  if (!apiKeyDb) return next(new Forbidden());
  if (!apiKeyDb.status) return next(new Forbidden());
  req.apiKey = apiKeyDb;
  next();
};
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const { apiKey } = req;
    if (!apiKey) return next(new Forbidden());
    const inValidPermission = apiKey.permissions.includes(permission);
    if (!inValidPermission) return next(new Forbidden('Permission denied'));
    next();
  };
};
module.exports = { apiKey, checkPermission };
