"use strict";

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

const statusCode = {
  FORBIDDEN: 403,
  CONFLICT: 409,
};

const responseStatusCode = {
  FORBIDDEN: "Bad request error",
  CONFLICT: "Conflict error",
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message = responseStatusCode.CONFLICT, status = statusCode.FORBIDDEN) {
    super(message, status);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = responseStatusCode.CONFLICT, status = statusCode.FORBIDDEN) {
    super(message, status);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrases.UNAUTHORIZED, status = StatusCodes.UNAUTHORIZED) {
    super(message, status);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_FOUND, status = StatusCodes.NOT_FOUND) {
    super(message, status);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message = ReasonPhrases.FORBIDDEN, status = StatusCodes.FORBIDDEN) {
    super(message, status);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
