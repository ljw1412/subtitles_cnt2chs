const pth = require('path')
const fs = require('fs').promises

async function isExists(path) {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    return false
  }
}

async function listFiles(path, ext) {
  const list = await fs.readdir(path)

  const fileList = []
  await Promise.all(
    list
      .filter(filename => !filename.includes('_sify'))
      .map(async filename => {
        const fPath = pth.join(path, filename)
        const stat = await fs.stat(fPath)
        if (stat.isFile()) {
          fileList.push(fPath)
        }
        return fPath
      })
  )
  return ext
    ? fileList.filter(item => pth.extname(item).toLowerCase() === ext)
    : fileList
}

async function readFile(path) {
  try {
    // const buffer = await fs.readFile(path, { encoding: 'utf16le' })
    const buffer = await fs.readFile(path)
    let str
    if (buffer.length > 3) {
      if (buffer[0] === 0xff && buffer[1] === 0xfe) {
        str = buffer.toString('utf16le')
      } else if (
        buffer[0] === 0xef &&
        buffer[1] === 0xbb &&
        buffer[3] === 0xbf
      ) {
        str = buffer.toString('utf8')
      } else {
        str = buffer.toString('utf8')
      }
    }
    return str
  } catch (error) {
    console.error(err)
    return null
  }
}

async function writeFile(path, str, cover = false) {
  try {
    if (!cover && (await isExists(path))) {
      const { dir, ext, name } = pth.parse(path)
      path = pth.format({
        dir,
        name: 'sify_' + name,
        ext: ext.toLowerCase()
      })
    }
    return await fs.writeFile(path, str)
  } catch (err) {
    console.error(err)
    return null
  }
}

module.exports = {
  isExists,
  listFiles,
  readFile,
  writeFile
}
