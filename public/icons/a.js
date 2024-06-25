import { readdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '')

const obj = {
  'arco-design': {},
  iconpark: {},
}

Object.entries(obj).forEach(([k, v]) => {
  readdirSync(path.resolve(rootDir, k)).forEach((file) => {
    v[file] = file
  })
})

console.log(obj)
