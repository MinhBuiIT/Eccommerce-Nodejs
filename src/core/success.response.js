'use strict';
const StatusCode = {
  OK: 200,
  CREATED: 201
};
const reasonStatusCode = {
  OK: 'OK',
  CREATED: 'Created'
};
class SuccessResponse {
  constructor({ message, statusCode, metadata = {} }) {
    this.message = message;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
  send(res) {
    return res.status(this.statusCode).json(this);
  }
}
class OKResponse extends SuccessResponse {
  constructor({ message = reasonStatusCode.OK, metadata = {} }) {
    super({ message, statusCode: StatusCode.OK, metadata });
  }
}
class CreatedResponse extends SuccessResponse {
  constructor({ message = reasonStatusCode.CREATED, metadata = {} }) {
    super({ message, statusCode: StatusCode.CREATED, metadata });
  }
}
module.exports = { SuccessResponse, OKResponse, CreatedResponse };
