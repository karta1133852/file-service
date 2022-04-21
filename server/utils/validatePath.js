module.exports = (req, res, next) => {
  req.validPath = true
  next()
}