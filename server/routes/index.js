// 載入套件
const router = require('express').Router()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const ForbiddenError = require('../utils/error/ForbiddenError')
const validatePath = require('../utils/validatePath')

// middleware
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieParser())

// 監聽前往下一層的請求
router.use('/auth', validatePath, (req, res, next) => {
  res.message = 'auth'
  next()
})

router.use('/file', require('./file'))

router.use('/*', (req, res, next) => {
  if (req.validPath === true) {
    next()
  } else {
    next(new ForbiddenError('Invalid Path'))
  }
})


// error handler
router.use((err, req, res, next) => {

  console.log(err)
  // format error and send response
  const errorLog = {
    message: undefined,
    status: err.statusCode,
    stack: err.stack
  }

  if (err.constructor.name === 'ForbiddenError') {
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

  return res.status(errorLog.status)
})

// response handler
router.use((req, res, next) => {

  const response = {
    success: true,
    message: res.message || undefined,
    result: res.result || {}
  }

  return res.status(200).send(res.message)
})



module.exports = router