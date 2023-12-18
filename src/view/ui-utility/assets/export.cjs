const fs = require('fs')
const path = require('path')

let reg = /.(svg|png|jpg|jpeg|webp|gif)$/
const root = path.resolve(__dirname, '')
const imports = []
const $exports = []

function recurse(root, dirs = []) {
  fs.readdirSync(root).forEach((file) => {
    const fpath = path.resolve(root, file)
    if (fs.lstatSync(fpath).isDirectory()) {
      let dir = file
      dirs.push(dir)
      recurse(fpath, dirs)
      dirs.pop()
    } else if (reg.test(file)) {
      genName(file, dirs)
    }
  })
}

function genName(file, dirs, i) {
  const splits = file.split('.')
  const last = splits.length - 1
  const assertName = splits.slice(0, last).join('.').replace(' ', '')
  const name = [...(dirs.join('_') + '_' + assertName)]
  while ((i = name.findIndex((i) => /[^\w\d$_\u4e00-\u9fa5]/.test(i))) >= 0) {
    void (name[i] = '') || (name[i + 1] = name[i + 1]?.toUpperCase() || name[i + 1])
  }
  imports.push(`import $_${name.join('')} from './${dirs.join('/')}/${file}'`)
  $exports.push(`$_${name.join('')}`)
}

recurse(root)
fs.writeFileSync(
  path.resolve(root, 'index.ts'),
  `${imports.join('\n')}\n\nexport {\n  ${$exports.join(',\n  ')}\n}`
)

console.log('success\n')
