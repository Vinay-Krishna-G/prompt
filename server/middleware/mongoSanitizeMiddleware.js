import mongoSanitize from 'express-mongo-sanitize';

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

function replaceObjectContents(target, source) {
  // Clear existing keys
  for (const k of Object.keys(target)) delete target[k];
  // Assign sanitized keys
  for (const [k, v] of Object.entries(source)) target[k] = v;
}

/**
 * Express 5 compatibility: `req.query` can be getter-only depending on stack.
 * `express-mongo-sanitize` tries to assign `req.query = ...`, which can throw.
 *
 * This wrapper sanitizes using the library, but applies results by mutating
 * the existing objects (when possible) instead of reassigning `req[key]`.
 */
export function mongoSanitizeMiddleware(options = {}) {
  return function (req, _res, next) {
    for (const key of ['body', 'params', 'headers', 'query']) {
      const current = req[key];
      if (!current) continue;

      const sanitized = mongoSanitize.sanitize(current, options);

      if (isPlainObject(current) && isPlainObject(sanitized)) {
        replaceObjectContents(current, sanitized);
      } else if (Array.isArray(current) && Array.isArray(sanitized)) {
        current.length = 0;
        current.push(...sanitized);
      } else if (key !== 'query') {
        // Avoid reassigning query due to potential getter-only property.
        req[key] = sanitized;
      } else {
        // Last resort: do nothing (keeps original query) rather than crash.
      }
    }

    next();
  };
}

