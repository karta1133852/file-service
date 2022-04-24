const LocalStrategy = require('passport-local').Strategy

const tableName = process.env.MAIN_TABLE
const options = { usernameField: 'username', passwordField: 'password' }

const verifyFunction = async (username, password, done) => {
  
  // 僅模擬登入驗證
  if (username !== process.env.AUTH_TEST_USERNAME) {
    return done(null, false, 404)
  } else if (password !== process.env.AUTH_TEST_PASSWORD) {
    return done(null, false, 422)
  } else {
    return done(null, { username })
  }
}

module.exports = new LocalStrategy(options, verifyFunction)