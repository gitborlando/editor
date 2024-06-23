import { transform } from '@svgr/core'
import camelCase from 'camelcase'
import fs, { readFileSync, unlinkSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let reg = /.(svg|png|jpg|jpeg|webp|gif|tsx|ttf)$/
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '')
const imports = []
const names = []
const asset = {}
const ignore = ['snapshots', 'icons']

function recurse(root, dirs = []) {
  fs.readdirSync(root).forEach((file) => {
    const fPath = path.resolve(root, file)
    if (ignore.includes(file)) return
    if (fs.lstatSync(fPath).isDirectory()) {
      let dir = file
      dirs.push(dir)
      recurse(fPath, dirs)
      dirs.pop()
    } else if (reg.test(file)) {
      genName(file, dirs)
    }
  })
}

function genName(file, dirs) {
  const splits = file.split('.')
  const assetName = splits
    .slice(0, splits.length - 1)
    .join('.')
    .replace(' ', '')
  const assetType = splits[splits.length - 1]
  const isSvg = assetType.match(/svg/)
  if (isSvg) {
    const rawSvg = readFileSync(`${rootDir}/${dirs.join('/')}/${file}`, 'utf-8')
    const tsx = transform.sync(rawSvg, {
      jsxRuntime: 'automatic',
      typescript: true,
      memo: true,
      ref: true,
      plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    })
    writeFileSync(`${rootDir}/${dirs.join('/')}/${assetName}.tsx`, tsx, 'utf-8')
    unlinkSync(`${rootDir}/${dirs.join('/')}/${file}`)
  }
  const name = camelCase([dirs.join('_') + '_' + assetName], { pascalCase: true })
  names.push(name)
  imports.push(
    `import ${name} from './${dirs.join('/')}/${assetName}.${isSvg ? 'tsx' : assetType}'`
  )
  let obj = asset
  for (let i = 0; i < dirs.length; i++) {
    if (!obj[dirs[i]]) obj[dirs[i]] = {}
    obj = obj[dirs[i]]
  }
  obj[camelCase(assetName)] = name
}

function add(obj, indent = 1) {
  let res = ''
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === 'object') {
      res += `${sp(indent) + camelCase(k)}: ${add(v, indent + 1)},\n`
    } else {
      res += `${sp(indent) + camelCase(k)}: ${v},\n`
    }
  })
  return `{\n${res + sp(indent - 1)}}`
}
const sp = (num) => '  '.repeat(num)

recurse(rootDir)

fs.writeFileSync(
  path.resolve(rootDir, 'index.ts'),
  `${imports.join('\n')}\n\nconst Asset = ${add(asset)}\n\nexport default Asset`
)

console.log('success\n')
