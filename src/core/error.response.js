'use strict';
const statusCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
};
const reasonStatusCode = {
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found'
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
class BadRequest extends ErrorResponse {
  constructor(message = reasonStatusCode.BAD_REQUEST) {
    super(message, statusCode.BAD_REQUEST);
  }
}
class Unauthorized extends ErrorResponse {
  constructor(message = reasonStatusCode.UNAUTHORIZED) {
    super(message, statusCode.UNAUTHORIZED);
  }
}
class Forbidden extends ErrorResponse {
  constructor(message = reasonStatusCode.FORBIDDEN) {
    super(message, statusCode.FORBIDDEN);
  }
}
class NotFound extends ErrorResponse {
  constructor(message = reasonStatusCode.NOT_FOUND) {
    super(message, statusCode.NOT_FOUND);
  }
}
module.exports = { ErrorResponse, BadRequest, Unauthorized, Forbidden, NotFound };
