/**
 * Standard API success envelope.
 */
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standard API failure envelope (for non-throwing handlers).
 */
export function sendFailure(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
