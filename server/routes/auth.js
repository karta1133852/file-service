// 載入套件
const router = require('express').Router()
const jwtToken = require('../utils/jwtToken')
const passport = require('../config/passport/passport')

const ForbiddenError = require('../utils/error/ForbiddenError')
const NotFoundError = require('../utils/error/NotFoundError')

router.post('/login', passport.authenticate('local', { session: true }), jwtToken, (req, res, next) => {
  
  res.result = { user: req.user, token: res.token }
  next()
})

module.exports = router