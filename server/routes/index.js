// 載入套件
const router = require('express').Router()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const ForbiddenError = require('../utils/error/ForbiddenError')
const validatePath = require('../utils/validatePath')
const deleteTmpFile = require('../utils/files/deleteTmpFile')

// middleware
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieParser())

// 監聽前往下一層的請求
router.use('/auth', validatePath, (req, res, next) => {
  res.message = 'auth'
  next()
})

router.use('/file', validatePath, require('./file'))

router.use('/*', (req, res, next) => {
  if (req.validPath === true) {
    next()
  } else {
    next(new ForbiddenError('Invalid Path'))
  }
})


// error handler
router.use(async (err, req, res, next) => {

  // 將暫存檔刪除
  try {
    await deleteTmpFile(req.file)
  } catch (errDelTmp) {
    next(errDelTmp)
  }

  console.log(err)
  // format error and send response
  const errorLog = {
    message: undefined,
    status: err.statusCode
  }
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack == err.stack
  }

  if (err.constructor.name === 'ForbiddenError') {
    errorLog.message = {
      title: err.title,
      content: err.content
    }
  } else if (err.constructor.name === 'NotFoundError') {
    errorLog.message = {
      title: err.title,
      content: err.content
    }
  } else {
    errorLog.status = 500
    errorLog.message = {
      title: 'Unknown Error',
      content: err.message
    }
  }

  return res.status(errorLog.status).send(errorLog.message)
})

// response handler
router.use(async (req, res, next) => {

  // 將暫存檔刪除
  try {
    await deleteTmpFile(req.file)
  } catch (errDelTmp) {
    next(errDelTmp)
  }

  const response = {
    success: true,
    message: res.message || undefined,
    result: res.result || {}
  }

  // TODO 回傳訊息
  return res.status(200).send(res.message)
})



module.exports = router