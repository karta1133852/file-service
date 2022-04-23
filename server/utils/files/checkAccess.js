const fs = require('fs')
const fsPromises = require('fs/promises')

// 檢查 request 的存取是否合法
const checkAccess = async (req, path) => {
  
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
}

/**
 * 檢查檔案或目錄是否存在
 * @param {string} path
 * @returns {Boolean} isExists
 */
async function checkExists (path) {

  try {
    await fsPromises.stat(path)
    return true
  } catch (err) {
    return false
  }
}

async function checkPostAccess (req, file) {

  let stat = await checkExists(file, false)
  if (!stat) {  // 檔案不存在
    return true
  } else return false
}

async function checkPatchAccess (req, file) {

  let stat = await checkExists(path)
  
}

async function checkDeleteAccess (req, file) {

  let stat = await checkExists(path)
  if (!stat) {  // 檔案不存在
    return true
  } else return false
}

module.exports = { checkAccess, checkExists }