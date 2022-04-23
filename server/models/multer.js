const multer = require('multer')
const fs = require('fs')
const fsPromise = require('promise-fs')
const { checkAccess } = require('../utils/files/checkAccess')

// 動態處理路徑
const dynamicUploadSingle = async (req, res, next) => {

  let path = process.env.ROOT_PATH + req.path.replaceAll('/', '\\')
  if (path.at(-1) === '\\') {
    path.slice(0, -1)
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let pathFile, pathDir
      // 同時考慮 {localSystemFilePath} 為 file/dir 的可能性
      if (path.endsWith(file.originalname)) {
        pathFile = path
        pathDir = path.slice(0, -file.originalname.length)
      } else {
        pathFile = path + '\\' + file.originalname
        pathDir = path
      }
      cb(null, pathDir)
    },
    filename: (req, file, cb) => {

      cb(null , file.originalname)
    }
  })
  const fileFilter = async (req, file, cb) => {

    let { method } = req
    console.log(method)

    let getAccess = await checkAccess(req, path, file)
    cb(null, getAccess)
  }
  const upload = multer({ storage, fileFilter })

  // 相當於 next() -> upload.single('file')
  upload.single('file')(req, res, next)
}

module.exports = dynamicUploadSingle