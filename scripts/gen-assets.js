import fs from 'fs'
import path from 'path'

// 源目录和目标文件
const sourceDir = 'public/static'
const outputFile = 'src/view/static.ts'

// 递归获取所有文件
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir)

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      getAllFiles(fullPath, files)
    } else {
      files.push(fullPath)
    }
  }

  return files
}

// 将文件路径转换为对象结构
function pathToObject(filePath) {
  const relativePath = path.relative(sourceDir, filePath)
  const parts = relativePath.split(path.sep)
  const fileName = path.basename(parts[parts.length - 1])
  const ext = path.extname(fileName)
  const nameWithoutExt = path.basename(fileName, ext)

  // 转换为驼峰命名
  const camelCase = nameWithoutExt.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())

  // 构建路径
  const webPath = '/static/' + relativePath.replace(/\\/g, '/')

  return { parts: parts.slice(0, -1), key: camelCase, value: webPath }
}

// 构建嵌套对象
function buildNestedObject(files) {
  const result = {}

  for (const file of files) {
    const { parts, key, value } = pathToObject(file)
    let current = result

    for (const part of parts) {
      // 转换为驼峰命名
      const camelPart = part.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())

      if (!current[camelPart]) {
        current[camelPart] = {}
      }
      current = current[camelPart]
    }

    current[key] = value
  }

  return result
}

// 生成 TypeScript 代码
function generateTypeScriptCode(obj, indent = 2) {
  const spaces = ' '.repeat(indent)
  let code = ''

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      code += `${spaces}${key}: '${value}',\n`
    } else {
      code += `${spaces}${key}: {\n`
      code += generateTypeScriptCode(value, indent + 2)
      code += `${spaces}},\n`
    }
  }

  return code
}

// 确保目录存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// 生成资源常量文件
function generateAssetsFile() {
  console.log('开始生成资源路径常量...')

  // 获取所有文件
  const allFiles = getAllFiles(sourceDir)
  console.log(`找到 ${allFiles.length} 个文件`)

  // 构建对象结构
  const assetsObject = buildNestedObject(allFiles)

  // 生成 TypeScript 代码
  const tsCode = `// 自动生成的静态资源路径常量
export const Static = {
${generateTypeScriptCode(assetsObject)}
} as const;
`

  // 确保目标目录存在
  ensureDir(path.dirname(outputFile))

  // 写入文件
  fs.writeFileSync(outputFile, tsCode, 'utf8')
  console.log(`✅ 已生成: ${outputFile}`)
  console.log(`包含 ${allFiles.length} 个资源路径`)
}

// 文件监听功能
function watchFiles() {
  console.log('开始监听文件变化...')
  console.log(`监听目录: ${sourceDir}`)
  console.log('按 Ctrl+C 停止监听\n')

  // 使用 fs.watch 监听目录变化
  const watcher = fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return

    const fullPath = path.join(sourceDir, filename)

    console.log(`\n检测到文件变化: ${eventType} - ${filename}`)

    if (eventType === 'change' || eventType === 'rename') {
      // 等待文件写入完成
      setTimeout(() => {
        console.log('重新生成资源常量文件...')
        generateAssetsFile()
      }, 100)
    }
  })

  // 处理错误
  watcher.on('error', (error) => {
    console.error('监听错误:', error)
  })

  return watcher
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'watch':
    case '--watch':
    case '-w':
      // 先执行一次完整生成
      generateAssetsFile()
      // 然后开始监听
      const watcher = watchFiles()

      // 处理进程退出
      process.on('SIGINT', () => {
        console.log('\n停止监听...')
        watcher.close()
        process.exit(0)
      })
      break

    default:
      // 默认执行一次生成
      generateAssetsFile()
      break
  }
}

// 运行主函数
main()
