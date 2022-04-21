const LocalStrategy = require('passport-local').Strategy

const tableName = process.env.MAIN_TABLE
const options = { usernameField: 'uid', passwordField: 'password' }

const verifyFunction = async (uid, password, done) => {
  /*try {
    const user = await docClient.get({
      TableName: tableName,
      Key: { uid: uid }
    }).promise()

    if (!user.Item) {
      return done(null, false, 404)
    } else if (user.Item.password !== password) {
      return done(null, false, 422)
    } else {
      delete user.Item.password
      return done(null, user.Item)
    }
  } catch (err) {
    return done(null, false, 500)
  }*/
}

module.exports = new LocalStrategy(options, verifyFunction)