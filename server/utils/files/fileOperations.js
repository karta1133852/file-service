const fs = require('fs')
const fsPromises = require('fs/promises')
const ForbiddenError = require('../error/ForbiddenError')

const fileOperations = {
  // 檢查 request 的存取是否合法
  async checkAccess (req, path) {
    
    let { method } = req

    let ifNotExistsThenDenied
    if (method === 'GET') {
      return true
    } else if (method === 'POST') {
      ifNotExistsThenDenied = false
    } else {  // TODO PATCH, DELETE 若檔案 or 路徑不存在，返回 Error
      ifNotExistsThenDenied = true
    }

    let isExists = await checkExists(path)
    return !(isExists ^ ifNotExistsThenDenied)
  },
  /**
   * 檢查檔案或目錄是否存在
   * @param {string} path
   * @returns {Boolean} isExists
   */
  async checkExists (path) {

    try {
      await fsPromises.stat(path)
      return true
    } catch (err) {
      return false
    }
  },
  /**
   * 檢查該 path 為目錄或檔案
   * @param {string} path
   * @returns {string} type
   */
  async checkType (path) {
    try {
      let stat = await fsPromises.stat(path)
      if (stat.isDirectory()) return 'Directory'
      else if (stat.isFile()) return 'File'
      else return undefined
    } catch (err) {
      return null
    }
  },
  async queryFiles() {
    
  },
  /**
   * 複製檔案
   * @param {string} pathOrigin
   * @param {string} pathDest
   * @param {Boolean} overwrite 覆蓋舊檔案
   */
  async copyFile(pathSrc, pathDest, overwrite = false) {

    // 根據 checkIsExists 檢查目標檔案是否已經存在
    if (!overwrite && await checkExists(pathDest, false)) {
      throw new ForbiddenError('Target file already exists')
    }
    
    await fsPromises.copyFile(pathSrc, pathDest)
  },
  async createDir(pathDir) {
    // 若 Dir 已存在不會 Error
    await fsPromises.mkdir(pathDir, { recursive: true })
  },
  async deleteFile(path, ignoreNotExists = false) {
    await fsPromises.rm(path, { force: ignoreNotExists })
  }
}

module.exports = fileOperations