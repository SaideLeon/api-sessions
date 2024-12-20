// src/utils/AppError.js
export class AppError {
  constructor(message, statusCode = 400, errors = []) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    this.isOperational = true;
    this.errors = errors; // Inclui detalhes dos erros

    Error.captureStackTrace(this, this.constructor);
  }
}
