import AppError from '../utils/AppError.js';

/**
 * Validates `req.body` with a Zod object schema and replaces `req.body` with parsed output.
 */
export const validateBody = (schema) => (req, res, next) => {
  console.log('[VALIDATE] Body:', req.body);
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.length ? issue.path.join('.') : 'body'}: ${issue.message}`)
      .join('; ');
    return next(new AppError(message, 400));
  }
  req.body = result.data;
  next();
};
