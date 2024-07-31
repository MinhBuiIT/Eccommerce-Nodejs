'use strict';
const errorHandler = (error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    code: statusCode,
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};
module.exports = { errorHandler };
