const { Router } = require('express');
const { authenticateHanlderV2 } = require('../../middlewares/access.middleware');
const discountController = require('../../controllers/discount.controller');
const catchError = require('../../utils/catchError');

const discountRoute = Router();
//USER
discountRoute.get('/:code/products', catchError(discountController.getProductByDiscount));
discountRoute.post('/amount', catchError(discountController.getAmountDiscountProduct));
discountRoute.post('/cancel', catchError(discountController.cancleDiscountUser));
//SHOP
discountRoute.use(authenticateHanlderV2);
discountRoute.get('/', catchError(discountController.getAllDiscountsByShop));
discountRoute.delete('/:code', catchError(discountController.deleteDiscount));

discountRoute.post('/', catchError(discountController.createDiscount));

discountRoute.patch('/:id', catchError(discountController.updateDiscount));

module.exports = discountRoute;
