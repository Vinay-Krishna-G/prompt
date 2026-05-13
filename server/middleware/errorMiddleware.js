import AppError from '../utils/AppError.js';

/**
 * Catch-all middleware for routes that do not exist
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
};

/**
 * Utility functions to sanitize specific development errors for cleaner outputs
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const fields = err?.keyValue ? Object.keys(err.keyValue) : [];
  const message =
    fields.length > 0
      ? `Duplicate field value for: ${fields.join(', ')}. Please use another value.`
      : 'Duplicate field value. Please use another value.';
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Detailed Error Response for Development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    status: err.status,
    error: { name: err.name },
    stack: err.stack,
  });
};

/**
 * Cleaned Sanitized Error Response for Production
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error('CRITICAL ERROR', err);
    res.status(500).json({
      success: false,
      message: 'Something went very wrong on our end!',
    });
  }
};

/**
 * Global Exception Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err;
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  else if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
    return;
  }

  sendErrorProd(error, res);
};
