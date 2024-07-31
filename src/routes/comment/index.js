const commentController = require('../../controllers/comment.controller');
const catchError = require('../../utils/catchError');

const route = require('express').Router();

route.post('/', catchError(commentController.createComment));
route.get('/', catchError(commentController.getComments));
route.post('/delete', catchError(commentController.deleteComment));

module.exports = route;
