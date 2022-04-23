// 載入套件
const router = require('express').Router()
const validatePath = require('../utils/validatePath')
const ForbiddenError = require('../utils/error/ForbiddenError')
const fs = require('fs')
const path = require('path')


router.post('/*', require('../models/multer'), validatePath, (req, res, next) => {

  res.message = req.file

  next()
})

module.exports = router