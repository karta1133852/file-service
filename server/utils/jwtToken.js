const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const payload = { username: req.user.username }
  const token = jwt.sign(payload, process.env.JWT_SECRET)
  res['token'] = token
  return next()
}