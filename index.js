const program = require('commander')
const inquirer = require('inquirer')
const utils = require('./utils')
const { execute, executeAll } = require('./executor')

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
      choices: ['.ass', '.ssa']
    }
  ])
  return answers
}

async function main() {
  let { directory, ext } = await input()

  if (await utils.isExists(directory)) {
    const fileList = await utils.listFiles(directory, ext)
    await executeAll(fileList, {
      'Default,方正准圆_GBK': 'Default,黑体'
    })
  } else {
    await main()
  }
}

main()
