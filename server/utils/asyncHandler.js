/**
 * Higher-order function wrapping async express routes
 * Replaces repetitive try-catch blocks by forwarding rejections to next()
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
