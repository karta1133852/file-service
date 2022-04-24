class UnauthorizedError extends Error {
  constructor (content) {
    super('Unauthorized Error')

    this.title = '請求失敗'
    this.content = content
    this.statusCode = 401
  }

  getUIMessage () {
    return { title: this.title, content: this.content }
  }
}

module.exports = UnauthorizedError