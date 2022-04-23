const fileOperations = require('./fileOperations')

async function deleteTmpFile(file) {
  if (file) {
    try {
      await fileOperations.deleteFile(file.path, true)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = deleteTmpFile