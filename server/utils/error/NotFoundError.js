class NotFoundError extends Error {
  constructor (content) {
    super('Not Found Error')

    this.title = '請求失敗'
    this.content = content
    this.statusCode = 404
  }

  getUIMessage () {
    return { title: this.title, content: this.content }
  }
}

module.exports = NotFoundError