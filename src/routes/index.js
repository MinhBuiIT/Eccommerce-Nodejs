'use strict';
const express = require('express');
const { apiKey, checkPermission } = require('../auth/checkApiKey');

const router = express.Router();
//api-key
router.use(apiKey);
//check permission
router.use(checkPermission('0000'));
router.use('/v1/api/comment', require('./comment'));
router.use('/v1/api/checkout', require('./checkout'));
router.use('/v1/api/cart', require('./cart'));
router.use('/v1/api/product', require('./product'));
router.use('/v1/api/discount', require('./discount'));
router.use('/v1/api/shop', require('./access'));
module.exports = router;
