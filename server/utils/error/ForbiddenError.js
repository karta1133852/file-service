class ForbiddenError extends Error {
  constructor (content) {
    super('Forbidden Error')

    this.title = '請求失敗'
    this.content = content
    this.statusCode = 403
  }

  getUIMessage () {
    return { title: this.title, content: this.content }
  }
}

module.exports = ForbiddenError