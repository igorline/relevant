
exports.asyncMiddleware = fn =>
  async (req, res, next) => {
    try {
      const result = await fn(req);
      res.jsonResponse = result;
      next();
    } catch (err) {
      next(err);
    }
  };
