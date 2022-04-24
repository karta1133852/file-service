const fs = require('fs')
const fsPromises = require('fs/promises')
const pathOperations = require('path')
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
    } else {
      ifNotExistsThenDenied = true
    }

    let isExists = await this.isExists(path)
    return !(isExists ^ ifNotExistsThenDenied)
  },
  /**
   * 檢查檔案或目錄是否存在
   * @param {string} path
   * @returns {Boolean} isExists
   */
  async isExists (path) {

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
  /**
   * 複製檔案
   * @param {string} pathOrigin
   * @param {string} pathDest
   * @param {Boolean} overwrite 覆蓋舊檔案
   */
  async copyFile (pathSrc, pathDest, overwrite = false) {

    // 根據 checkIsExists 檢查目標檔案是否已經存在
    if (!overwrite && await this.isExists(pathDest, false)) {
      throw new ForbiddenError('Target file already exists')
    }
    
    await fsPromises.copyFile(pathSrc, pathDest)
  },
  async createDir (pathDir) {
    // 若 Dir 已存在不會 Error
    await fsPromises.mkdir(pathDir, { recursive: true })
  },
  async deleteFile (path, ignoreNotExists = false) {
    await fsPromises.rm(path, { force: ignoreNotExists })
  },
  /**
   * 篩選目錄底下之檔案列表
   * @param {string} pathDir
   * @param {Object} query req.query
   * @param {Array} filesInfo 檔案列表
   */
  async queryFiles (pathDir, query) {
    // ascending
    const cmpFunc = {
      fileName : (a, b) => ( a > b ? 1 : -1 ),
      size: (a, b) => ( a.size - b.size ),
      lastModified: (a, b) => ( a.lastModified.getTime() - b.lastModified.getTime() )
    }

    let filesInfo = []
    const files = await fsPromises.readdir(pathDir)
    // TODO iterate files and get info
    for (let i = 0; i < files.length; i++) {
      filesInfo.push(await this.getFileInfo(pathDir, files[i]))
    }
    
    let cmpfunc
    if (query.hasOwnProperty('orderBy')) {
      cmpfunc = cmpFunc[query.orderBy]
      if (!cmpfunc) return filesInfo  // orderBy 類別錯誤，視為不排序

      // 預設 Ascending
      filesInfo.sort(cmpfunc)
      if (query.orderByDirection === 'Descending')
        filesInfo.reverse()
    }

    if (query.hasOwnProperty('filterByName')) {
      filesInfo = filesInfo.filter(fInfo => {
        return fInfo.fileName.toLowerCase().includes(query.filterByName.toLowerCase())
      })
    }

    return filesInfo
  },
  // 取得單一檔案之大小、修改時間
  async getFileInfo (pathDir, fileName) {

    const stat = await fsPromises.stat(pathOperations.join(pathDir, fileName))
    if (!stat) return null

    const isDir = stat.isDirectory()
    const fileInfo = {
      fileName: fileName + (isDir ? '/' : ''),
      size: stat.size,  // 資料夾 size 視為 0
      lastModified: stat.mtime  // 考慮到 server 只會修改 data 內容，故忽略 status changed
    }

    return fileInfo
  },
  async readFile (path) {
    return await fsPromises.readFile(path)
  }
}

module.exports = fileOperations