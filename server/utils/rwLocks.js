// rw-lock
const { RWLock } = require('readers-writer-lock')

async function setFileLock(fileRWLocks, sha256, action) {

  const locks = fileRWLocks.fileLocks
  if (action === 'start') { // 開始讀寫檔案
    await fileRWLocks.setFileLock.write(async () => {
      if (!locks.hasOwnProperty(sha256)) {
        locks[sha256] = {
          rwLock: new RWLock(),
          count: 1
        }
      } else {
        locks[sha256].count += 1
      }
      return
    })
  } else if (action === 'end') {  // 結束檔案讀寫
    await fileRWLocks.setFileLock.write(async () => {
      if (locks.hasOwnProperty(sha256) && locks[sha256].count <= 1) {
        delete locks[sha256]
      } else {
        locks[sha256].count -= 1
      }
      return
    })
  }
}

module.exports = { setFileLock }