const passport = require('passport')
const localStrategy = require('./strategy/localStrategy')
const jwtStrategy = require('./strategy/jwtStrategy')

passport.use(localStrategy)
passport.use(jwtStrategy)

module.exports = passport