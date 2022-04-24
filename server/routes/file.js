// 載入套件
const router = require('express').Router()
const validatePath = require('../utils/validatePath')
const fs = require('fs')
const path = require('path')
const redisClient = require('../models/redisClient')

const ForbiddenError = require('../utils/error/ForbiddenError')
const NotFoundError = require('../utils/error/NotFoundError')

const dynamicUploadSingle = require('../models/multer')
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

router.post('/*', dynamicUploadSingle, async (req, res, next) => {
  
  try {
    const sha256 = req.file.pathSha256
    
    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {

      const isExists = await fileOperations.isExists(req.file.pathFile)
      if (isExists) {
        throw new ForbiddenError('Target file already exists.')
      }

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

router.patch('/*', dynamicUploadSingle, async (req, res, next) => {
  
  try {
    const sha256 = req.file.pathSha256
  
    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
  
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {

      const isExists = await fileOperations.isExists(req.file.pathFile)
      if (!isExists) {
        throw new ForbiddenError('Target file not exists.\nCannot update.')
      }

      await fileOperations.copyFile(req.file.path, req.file.pathFile, true)
      
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

router.delete('/*', dynamicUploadSingle, async (req, res, next) => {
  
  try {
    const pathFile = path.join(process.env.ROOT_PATH, req.path)
    const sha256 = createHash('sha256', pathFile)

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