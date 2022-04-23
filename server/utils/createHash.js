const crypto = require('crypto')

function createHash (algorithm, str) {
  return crypto.createHash(algorithm).update(str).digest('hex')
}

module.exports = createHash