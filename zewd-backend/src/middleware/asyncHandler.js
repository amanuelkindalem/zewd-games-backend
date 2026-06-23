/**
 * Wraps an async Express route handler so any thrown error / rejected promise
 * is automatically passed to next(err) instead of needing try/catch everywhere.
 *
 * Usage:
 *   router.post("/", asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
