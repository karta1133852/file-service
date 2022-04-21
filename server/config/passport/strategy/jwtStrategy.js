const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const tableName = process.env.MAIN_TABLE
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

const verifyFunction = async (payload, done) => {
  
}

module.exports = new JwtStrategy(options, verifyFunction)
