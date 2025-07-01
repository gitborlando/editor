import fs from 'fs'
import path from 'path'

// 源目录和目标文件
const sourceDir = 'src/view/assets'
const outputFile = 'src/view/assets/assets.ts'

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

  // 生成包含路径信息的导入变量名
  const pathParts = [...parts.slice(0, -1), nameWithoutExt]
  const fullPathCamelCase = pathParts
    .join('-')
    .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
  const importVarName = fullPathCamelCase

  // 构建相对导入路径
  const importPath = './' + relativePath.replace(/\\/g, '/')

  return {
    parts: parts.slice(0, -1),
    key: camelCase,
    importVarName,
    importPath,
    originalPath: filePath,
  }
}

// 构建嵌套对象
function buildNestedObject(files) {
  const result = {}
  const imports = []

  for (const file of files) {
    const { parts, key, importVarName, importPath } = pathToObject(file)
    let current = result

    // 添加import语句
    imports.push({ importVarName, importPath })

    for (const part of parts) {
      // 转换为驼峰命名
      const camelPart = part.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())

      if (!current[camelPart]) {
        current[camelPart] = {}
      }
      current = current[camelPart]
    }

    // 使用导入的变量名而不是字符串路径
    current[key] = importVarName
  }

  return { result, imports }
}

// 生成 TypeScript 代码
function generateTypeScriptCode(obj, indent = 2) {
  const spaces = ' '.repeat(indent)
  let code = ''

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // 这里是导入的变量名，不加引号
      code += `${spaces}${key}: ${value},\n`
    } else {
      code += `${spaces}${key}: {\n`
      code += generateTypeScriptCode(value, indent + 2)
      code += `${spaces}},\n`
    }
  }

  return code
}

// 生成导入语句
function generateImportStatements(imports) {
  return imports
    .map(({ importVarName, importPath }) => `import ${importVarName} from '${importPath}';`)
    .join('\n')
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

  // 获取所有文件（排除当前要生成的文件）
  const allFiles = getAllFiles(sourceDir).filter(
    (file) => path.resolve(file) !== path.resolve(outputFile)
  )
  console.log(`找到 ${allFiles.length} 个文件`)

  if (allFiles.length === 0) {
    console.log('没有找到资源文件')
    return
  }

  // 构建对象结构和导入语句
  const { result: assetsObject, imports } = buildNestedObject(allFiles)

  // 生成导入语句
  const importStatements = generateImportStatements(imports)

  // 生成 TypeScript 代码
  const tsCode = `// 自动生成的静态资源路径常量
${importStatements}

export const Assets = {
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
