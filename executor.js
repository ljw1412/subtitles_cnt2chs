const utils = require('./utils')
const { tify, sify } = require('chinese-conv')

async function execute(path, rp = {}) {
  let context = await utils.readFile(path)
  // 自定义替换文本
  if (typeof rp === 'object') {
    Object.keys(rp).forEach(key => {
      regx = new RegExp(key, 'g')
      context = context.replace(regx, rp[key])
    })
  }
  // 文件解析
  const typeList = ['[Script Info]', '[V4 Styles]', '[Events]']
  const indexList = typeList
    .map(item => context.indexOf(item))
    .sort()
    .filter(item => item !== -1)
  if (indexList.length > 1) indexList.push(context.length)
  const subtitles = {}
  for (let i = 0; i < indexList.length - 1; i++) {
    const text = context.substr(indexList[i], indexList[i + 1])
    typeList.forEach(item => {
      if (text.includes(item)) subtitles[item] = text
    })
  }
  // 找到字幕块
  if (subtitles['[Events]']) {
    const events = subtitles['[Events]'].split('\r\n')
    const format = events[1]
      .replace(/Format: ?/g, '')
      .replace(/, /g, ',')
      .split(',')
    const textIndex = format.indexOf('Text')
    for (let i = 2; i < events.length; i++) {
      const event = events[i]
        .replace(/Dialogue: ?/g, '')
        .replace(/, /g, ',')
        .split(',')
      for (let j = textIndex + 1; j < event.length; j++) {
        event[textIndex] += ',' + event[j]
      }
      // event.length = textIndex + 1

      if (event.length - 1 >= textIndex) {
        // 原始字符串
        const oText = event[textIndex]
        // console.log(oText)
        // 排除日语文本的简体化
        if (/[\u3040-\u31ff]/g.test(oText)) continue
        // 简体化后
        const sText = sify(oText)
        // console.log(sText)
        // 替换原始字符串
        context = context.replace(oText, sText)
      }
    }
    utils.writeFile(path, context)
  }
}

async function executeAll(pathList, rp = {}) {
  for (let i = 0; i < pathList.length; i++) {
    const path = pathList[i]
    await execute(path, rp)
  }
}

async function srtSifyAll(pathList) {
  for (let i = 0; i < pathList.length; i++) {
    const path = pathList[i]
    let context = await utils.readFile(path)
    utils.writeFile(path, sify(context))
  }
}

module.exports = { execute, executeAll, srtSifyAll }
