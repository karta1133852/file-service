// 載入套件
const router = require('express').Router()
const validatePath = require('../utils/validatePath')
const ForbiddenError = require('../utils/error/ForbiddenError')
const fs = require('fs')
const path = require('path')
const redisClient = require('../models/redisClient')
const fileOperations = require('../utils/files/fileOperations')
const { checkAccess } = require('../utils/files/checkAccess')
// rw-lock
const { RWLock } = require('readers-writer-lock')
const { setFileLock } = require('../utils/rwLocks')

let fileRWLocks = {
  setFileLock: new RWLock(),
  fileLocks: {}
}

router.post('/*', require('../models/multer'), async (req, res, next) => {
  
  let hasAccess = await checkAccess(req, req.file.pathFile)
  if (!hasAccess) {
    return next(new ForbiddenError('Target file already exists'))
  }

  let sha256 = req.file.pathSha256
  // start lock
  try {
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {
      // TODO copy file to specified path
      await fileOperations.createDir(req.file.pathDir)
      await fileOperations.copyFile(req.file.path, req.file.pathFile, false)
      
      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    res.message = 'Upload success.'
    next()
  } catch (err) {
    next(err)
  }
})

module.exports = router;