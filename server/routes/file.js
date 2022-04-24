// 載入套件
const router = require('express').Router()
const passport = require('../config/passport/passport')
const contentDisposition = require('content-disposition')
const path = require('path')

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

router.use(passport.authenticate('jwt', { session: true }))

// TODO GET request
router.get('/*', async (req, res, next) => {

  try {
    const pathQuery = path.join(process.env.ROOT_PATH, req.path)
    const sha256 = createHash('sha256', pathQuery)

    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
    // read lock
    await fileRWLocks.fileLocks[sha256].rwLock.read(async () => {

      const isExists = await fileOperations.isExists(pathQuery)
      if (!isExists) {
        throw new NotFoundError('Target not found.')
      }

      const pathType = await fileOperations.checkType(pathQuery)
      const { query } = req
      if (pathType === 'File') {

        const fileName = path.basename(pathQuery)
        if (query.hasOwnProperty('filterByName')) {
          if (!fileName.toLowerCase().includes(query.filterByName.toLowerCase())) {
            throw new NotFoundError('Queried file not found.')
          }
        }

        const buffer = await fileOperations.readFile(pathQuery)
        // 設定檔案名稱並傳送 buffer
        res.set('Content-Disposition', contentDisposition(fileName))
        res.end(buffer)
        res['alreadySent'] = true
        
        return
      } else if (pathType === 'Directory') {
        // TODO lock all directory (?
        const filesInfo = await fileOperations.queryFiles(pathQuery, query)
        console.log(filesInfo)
        if (filesInfo.length === 0) {
          throw new NotFoundError('Queried files not found.')
        } else {
          const result = {
            isDirectory: true,
            files: filesInfo.map(fInfo => fInfo.fileName)
          }
          res.result = result
        }
      }

      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    next()
  } catch (err) {
    next(err)
  }
})

router.post('/*', dynamicUploadSingle, async (req, res, next) => {
  
  try {
    const sha256 = req.file.pathSha256
    
    // start lock
    await setFileLock(fileRWLocks, sha256, 'start')
    // write lock
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

    res.result = 'File successfully uploaded.'
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
    // write lock
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

    res.result = 'File successfully updated.'
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
    // write lock
    await fileRWLocks.fileLocks[sha256].rwLock.write(async () => {

      const pathType = await fileOperations.checkType(pathFile)
      if (pathType === null) {
        throw new NotFoundError('Target not found.')
      } else if (pathType === undefined) {
        throw new Error('Unknown Error')
      }
      
      await fileOperations.deleteFile(pathFile)
      
      return
    })

    // end lock
    await setFileLock(fileRWLocks, sha256, 'end')

    res.result = 'File successfully deleted.'
    next()
  } catch (err) {
    next(err)
  }
})


module.exports = router;