'use strict';
const express = require('express');
const catchError = require('../../utils/catchError');
const checkoutController = require('../../controllers/checkout.controller');

const router = express.Router();

router.post('/review', catchError(checkoutController.createCheckout));
router.post('/order', catchError(checkoutController.orderProduct));

module.exports = router;
