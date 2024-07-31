'use strict';
const express = require('express');
const catchError = require('../../utils/catchError');
const { authenticateHanlderV2 } = require('../../middlewares/access.middleware');
const productController = require('../../controllers/product.controller');

const router = express.Router();

//Authenticate
/**
 * Gửi x-api-key
 * Gửi x-client-id
 * Gửi Authorization
 */
router.get('/search/:textSearch', catchError(productController.searchProduct));
router.get('', catchError(productController.getProductAll));
router.get('/:id', catchError(productController.getOneProduct));

router.use(authenticateHanlderV2);
router.post('/create', catchError(productController.createProduct));
router.post('/publish/:id', catchError(productController.publishProduct));
router.post('/unpublish/:id', catchError(productController.unpublishProduct));

router.patch('/:id', catchError(productController.updateProduct));

router.get('/drafts', catchError(productController.getProductDraftAll));
router.get('/publishs', catchError(productController.getProductPublishAll));

module.exports = router;
