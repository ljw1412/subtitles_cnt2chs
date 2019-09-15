const utils = require('./utils')
const { tify, sify } = require('chinese-conv')

async function execute(path, rp = {}) {
  let context = await utils.readFile(path)
  if (typeof rp === 'object') {
    Object.keys(rp).forEach(key => {
      context = context.replace(key, rp[key])
    })
  }
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
        const oText = event[textIndex]
        console.log(oText)
        const sText = sify(oText)
        console.log(sText)
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

module.exports = { execute, executeAll }
