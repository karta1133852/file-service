const fs = require('fs')
const fsPromises = require('fs/promises')
const { checkExists } = require('./checkAccess')
const ForbiddenError = require('../error/ForbiddenError')

const fileOperations = {
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