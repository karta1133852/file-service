const UnauthorizedError = require('./error/UnauthorizedError')

function passportAuth (req, res, next) {

  if (req.isAuthenticated()) {
    return next()
  } else {
    next(new UnauthorizedError('Unauthorized. Please login first.'))
  }
}

module.exports = passportAuth