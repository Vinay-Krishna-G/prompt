/**
 * AppError custom class
 * Used to distinguish expected operational errors from unexpected developer/system errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Used to determine if error can be sent to client

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
