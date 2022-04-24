const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

const verifyFunction = async (payload, done) => {

  if (!payload || !payload.username) {
    return done(null, false, 401)
  }
  
  // 僅模擬登入驗證
  if (payload.username !== process.env.AUTH_TEST_USERNAME) {
    return done(null, false, 404)
  } else {
    return done(null, { username: payload.username })
  }
}

module.exports = new JwtStrategy(options, verifyFunction)
