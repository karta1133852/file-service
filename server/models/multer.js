const multer = require('multer');

// 動態處理路徑
const dynamicUploadSingle = (req, res, next) => {

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      // TODO check directory
      cb(null, './uploads');
     },
    filename: function (req, file, cb) {
      cb(null , file.originalname);
    }
  });
  const fileFilter = (req, file, cb) => {

    if (false) {
      cb(null, false)
    } else {
      cb(null, true)
    }
  }
  const upload = multer({ storage, fileFilter })

  // 相當於 next() -> upload.single('file')
  upload.single('file')(req, res, next)
}

module.exports = dynamicUploadSingle