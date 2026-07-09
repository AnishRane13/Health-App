const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Validates and coerces req.body / req.query / req.params against a Zod schema.
 *
 * Express 5's req.query is a re-parsing getter (mutations don't persist), so
 * the coerced/validated result is exposed on req.valid.{body,query,params}.
 * Downstream handlers should read validated input from req.valid.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.valid = {
      body: parsed.body ?? req.body,
      query: parsed.query ?? {},
      params: parsed.params ?? {},
    };
    // req.body is writable and commonly read directly — keep it in sync.
    if (parsed.body) req.body = parsed.body;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        field: e.path.slice(1).join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    return next(err);
  }
};

module.exports = validate;
