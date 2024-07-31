'use strict';
const express = require('express');
const catchError = require('../../utils/catchError');
const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.post('/add', catchError(cartController.addToCart));
router.post('/update', catchError(cartController.updateAmountProductCart));
router.get('/', catchError(cartController.getProductInCart));
router.post('/delete', catchError(cartController.deleteProductItemInCart));
router.post('/empty', catchError(cartController.deleteAllProductInCart));

module.exports = router;
