import fs, { writeFileSync } from 'fs'
import path from 'path'

const basePath = path.join(process.cwd(), 'dist', 'static', 'editor')

type Files = {
  content: string
  path: string
}

const svgFiles: Files[] = []

function readDir(dir: string) {
  const files = fs.readdirSync(dir)
  files.map((file) => {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      readDir(filePath)
    } else {
      const content = fs.readFileSync(filePath, 'utf-8')
      svgFiles.push({ content, path: filePath })
    }
  })
}

readDir(basePath)

svgFiles.forEach((file) => {
  let content = file.content
  const path = file.path
  const regExp = /(\w+)=([\d.]+)/g
  while (regExp.test(content)) {
    content = content.replace(regExp, `$1='$2'`)
  }
  writeFileSync(path, content)
})
