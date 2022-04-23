// 載入套件
const router = require('express').Router()
const validatePath = require('../utils/validatePath')
const ForbiddenError = require('../utils/error/ForbiddenError')
const fs = require('fs')
const path = require('path')
// rw-lock
const { RWLock, sleep } = require('readers-writer-lock')
let rwLock = new RWLock()

router.post('/*', require('../models/multer'), validatePath, (req, res, next) => {
  rwLock.write(async () => {
    // TODO copy file to specified path
    res.message = req.file
  })
  
  next()
})

module.exports = router;