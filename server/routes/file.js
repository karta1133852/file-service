// 載入套件
const router = require('express').Router()
const validatePath = require('../utils/validatePath')
const fs = require('fs')
const path = require('path')
const redisClient = require('../models/redisClient')

const ForbiddenError = require('../utils/error/ForbiddenError')
const NotFoundError = require('../utils/error/NotFoundError')

const fileOperations = require('../utils/files/fileOperations')
// rw-lock
const createHash = require('../utils/createHash')
const { RWLock } = require('readers-writer-lock')
const { setFileLock } = require('../utils/rwLocks')

let fileRWLocks = {
  setFileLock: new RWLock(),
  fileLocks: {}
}

// TODO GET request

router.post('/*', require('../models/multer'), async (req, res, next) => {
  
  try {
    let hasAccess = await fileOperations.checkAccess(req, req.file.pathFile)
    if (!hasAccess) {
      throw new ForbiddenError('Target file already exists.')
    }

    let sha256 = req.file.pathSha256

    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {

      await fileOperations.createDir(req.file.pathDir)
      await fileOperations.copyFile(req.file.path, req.file.pathFile, false)
      
      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    res.message = 'File successfully uploaded.'
    next()
  } catch (err) {
    next(err)
  }
})

router.patch('/*', require('../models/multer'), async (req, res, next) => {
  
  try {
    let hasAccess = await fileOperations.checkAccess(req, req.file.pathFile)
    if (!hasAccess) {
      throw new ForbiddenError('Target file already exists.')
    }

    let sha256 = req.file.pathSha256
  
    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {
      // TODO update file to specified path
      /*await fileOperations.createDir(req.file.pathDir)
      await fileOperations.copyFile(req.file.path, req.file.pathFile, false)*/
      
      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    res.message = 'File successfully updated.'
    next()
  } catch (err) {
    next(err)
  }
})

router.delete('/*', require('../models/multer'), async (req, res, next) => {
  
  try {
    let pathFile = path.join(process.env.ROOT_PATH, req.path)
    let sha256 = createHash('sha256', pathFile)

    if (await fileOperations.checkType(pathFile) === 'Directory') {
      throw new ForbiddenError('Cannot delete a directory.')
    }
  
    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {

      const pathType = await fileOperations.checkType(pathFile)
      if (pathType === null) {
        throw new NotFoundError('Target Not Found')
      } else if (pathType === undefined) {
        throw new Error('Unknown Error')
      }
      
      await fileOperations.deleteFile(pathFile)
      
      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    res.message = 'File successfully deleted.'
    next()
  } catch (err) {
    next(err)
  }
})


module.exports = router;