// 使用 dotenv 將環境變數讀入
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

// 載入套件及引入全局變數
const express = require('express')
const https = require('https')
const fs = require('fs')
const path = require('path')

const app = express()
const cors = require('cors')
const passport = require('./config/passport/passport')
const ForbiddenError = require('./utils/error/ForbiddenError')
const bodyParser = require('body-parser')

// 設定 passport 物件並初始化
//app.use(passport.initialize())

// 設定 cors
app.use(cors())
app.options('*', cors())

// 第一層路由
app.use('/api', require('./routes/index'))
app.use(/^\/(?!(api))/, (req, res, next) => next(new ForbiddenError('Invaild Path')))


module.exports = app

if (process.env.IS_LOCAL === 'true')
  app.listen(3000, () => console.log('Listening on port 3000...'))
