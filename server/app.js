// 使用 dotenv 將環境變數讀入
//if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
//}

// 載入套件及引入全局變數
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const https = require('https')

const app = express()
const cors = require('cors')
const passport = require('./config/passport/passport')
const ForbiddenError = require('./utils/error/ForbiddenError')

// middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: 'false',
  saveUninitialized: 'false',
  cookie: { maxAge: new Date(Date.now() + 86400 * 1000).getTime() }
}))

// 設定 passport 物件並初始化
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  // 只將 username 存到 session 中
  done(null, user.username)
})

passport.deserializeUser((username, done) => {
  // 目前無資料，不須實作
  done(null, { username })
})

// 設定 cors
app.use(cors())
app.options('*', cors())

// 第一層路由
app.use('/api', require('./routes/index'))
app.use('/*', (req, res, next) => next(new ForbiddenError('Invaild Path')))


module.exports = app

if (process.env.IS_LOCAL === 'true')
  app.listen(3000, () => console.log('Listening on port 3000...'))
