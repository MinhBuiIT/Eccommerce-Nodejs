'use strict';
const express = require('express');
const accessController = require('../../controllers/access.controller');
const catchError = require('../../utils/catchError');
const { authenticateHanlderV2 } = require('../../middlewares/access.middleware');

const router = express.Router();

router.post('/signup', catchError(accessController.signUp));
router.post('/login', catchError(accessController.login));

//Authenticate
/**
 * Gửi x-api-key
 * Gửi x-client-id
 * Gửi Authorization
 */
router.use(authenticateHanlderV2);
router.post('/refresh-token', catchError(accessController.refreshToken));
router.post('/logout', catchError(accessController.logout));

module.exports = router;
