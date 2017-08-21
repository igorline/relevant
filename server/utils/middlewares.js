

exports.asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req))
    .then(result => {
      if (res) res.jsonResponse = result;
      next();
      return result;
    })
    .catch(err => {
      next(err);
      if (!res) {
        throw err;
      }
    });
  };
