const multer = require('multer')
const crypto = require('crypto')
const path = require('path')

// 動態處理路徑
const dynamicUploadSingle = async (req, res, next) => {

  let localPath = path.join(process.env.ROOT_PATH, req.path)
  
  let pathFile, pathDir
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      
      // 同時考慮 {localSystemFilePath} 為 file or dir 的可能性
      if (localPath.endsWith(file.originalname)) {
        pathFile = localPath
        pathDir = path.dirname(localPath)
      } else {
        pathFile = path.join(localPath, file.originalname)
        pathDir = localPath
      }
      // 紀錄目標路徑
      file['pathFile'] = pathFile
      file['pathDir'] = pathDir
      file['pathSha256'] = crypto.createHash('sha256').update(file.pathFile).digest('hex')
      // 將檔案存放到暫存區，供後續 IO 操作
      cb(null, process.env.TMP_PATH)
    },
    filename: (req, file, cb) => {
      cb(null , Date.now() + '_' + file.originalname)
    }
  })
  const fileFilter = async (req, file, cb) => {
    cb(null, true)
  }
  const upload = multer({ storage, fileFilter })

  // 相當於 next() -> upload.single('file')
  upload.single('file')(req, res, next)
}

module.exports = dynamicUploadSingle