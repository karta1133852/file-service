const fs = require('fs')
const fsPromise = require('promise-fs')

// 檢查 request 的存取是否合法
const checkAccess = async (req, file) => {
  
  let { method } = req

  let ifNotExistsThenDenied
  if (method === 'GET') {
    return true
  } else if (method === 'POST') {
    ifNotExistsThenDenied = false
  } else {  // PATCH, DELETE 若檔案 or 路徑不存在，返回 Error
    ifNotExistsThenDenied = true
  }

  let isExists = await checkExists(file, false)

  let getAccess = !(isExists ^ ifNotExistsThenDenied)
  if (getAccess) {
    console.log('denied')
  } else {
    console.log('not denied')
  }
  
  return getAccess
}

/**
 * 檢查檔案或目錄是否存在
 * @param {Object} file
 * @param {Boolean} checkDir
 * @returns {Boolean} isExists
 */
async function checkExists (file, checkDir) {

  let stat
  let checkPath = (checkDir) ? file.destination : file.path
  try {
    await fsPromise.stat(checkPath)
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