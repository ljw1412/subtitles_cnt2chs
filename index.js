const program = require('commander')
const inquirer = require('inquirer')
const utils = require('./utils')
const { execute, executeAll, srtSifyAll } = require('./executor')

let directory = null
let ext = null

async function input() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'directory',
      message: '请输入要解析的文件夹目录:'
    },
    {
      type: 'list',
      name: 'ext',
      message: '请选择文件的后缀:',
      choices: ['.ass', '.ssa', '.srt']
    }
  ])
  return answers
}

async function main() {
  let { directory, ext } = await input()

  if (await utils.isExists(directory)) {
    const fileList = await utils.listFiles(directory, ext)
    if (ext === '.srt') {
      await srtSifyAll(fileList)
    } else {
      await executeAll(fileList, {
        方正兰亭中黑_GBK: '黑体',
        'MStiffHeiHK-UltraBold': '黑体'
      })
    }
  } else {
    await main()
  }
}

main()
