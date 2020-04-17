const boom = require('boom')

const asyncMiddleware = fn => (req, res, next) => (
  Promise.resolve(fn(req, res, next))
    .catch(err => (
      next(err.isBoom ? err : boom.badImplementation(err))
    ))
)

exports.asyncMiddleware = asyncMiddleware
