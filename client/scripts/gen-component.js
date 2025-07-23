#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

// 获取命令行参数
const componentName = process.argv[2]

if (!componentName) {
  console.error('❌ 错误: 请提供组件名称')
  console.log('📝 用法: node scripts/gen-component.js <组件名>')
  console.log('📝 示例: node scripts/gen-component.js MyButton')
  process.exit(1)
}

// 验证组件名格式（首字母大写的驼峰命名）
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ 错误: 组件名必须以大写字母开头，只能包含字母和数字')
  console.log('📝 正确格式示例: MyButton, UserCard, NavigationBar')
  process.exit(1)
}

// 将组件名转换为 kebab-case
const kebabCaseName = componentName.replace(/([A-Z])/g, (match, letter, index) => {
  return index === 0 ? letter.toLowerCase() : '-' + letter.toLowerCase()
})

// 定义组件文件夹路径
const componentDir = resolve('src/view/component', kebabCaseName)

// 检查文件夹是否已存在
if (existsSync(componentDir)) {
  console.error(`❌ 错误: 组件文件夹 "${kebabCaseName}" 已存在`)
  process.exit(1)
}

// 创建组件文件夹
try {
  mkdirSync(componentDir, { recursive: true })
  console.log(`📁 创建文件夹: ${componentDir}`)
} catch (error) {
  console.error('❌ 创建文件夹失败:', error.message)
  process.exit(1)
}

// props 文件模板
const propsTemplate = `export interface ${componentName}Props {
  className?: string
  children?: React.ReactNode
}
`

// TSX 文件模板
const tsxTemplate = `import { FC } from 'react'
import { useClassNames } from 'src/view/hooks/use-class-names'
import { ${componentName}Props } from './${kebabCaseName}-props'
import './${kebabCaseName}.less'

export const ${componentName}: FC<${componentName}Props> = ({ 
  className, 
  children,
  ...props 
}) => {
  const classNames = useClassNames(className, '${kebabCaseName}', {})
  return (
    <div 
      className={classNames}
      {...props}
    >
      {children}
    </div>
  )
}

${componentName}.displayName = '${componentName}'
`

// LESS 文件模板
const lessTemplate = `.${kebabCaseName} {

}
`

// 创建 TSX 文件
const tsxPath = join(componentDir, `${kebabCaseName}.tsx`)
try {
  writeFileSync(tsxPath, tsxTemplate, 'utf8')
  console.log(`📄 创建文件: ${tsxPath}`)
} catch (error) {
  console.error('❌ 创建 TSX 文件失败:', error.message)
  process.exit(1)
}

// 创建 LESS 文件
const lessPath = join(componentDir, `${kebabCaseName}.less`)
try {
  writeFileSync(lessPath, lessTemplate, 'utf8')
  console.log(`🎨 创建文件: ${lessPath}`)
} catch (error) {
  console.error('❌ 创建 LESS 文件失败:', error.message)
  process.exit(1)
}

// 创建 props 文件
const propsPath = join(componentDir, `${kebabCaseName}-props.ts`)
try {
  writeFileSync(propsPath, propsTemplate, 'utf8')
  console.log(`📄 创建文件: ${propsPath}`)
} catch (error) {
  console.error('❌ 创建 props 文件失败:', error.message)
  process.exit(1)
}

console.log('\n✅ 组件创建成功!')
console.log(`📂 组件位置: src/view/component/${kebabCaseName}/`)
console.log(`📝 可以这样使用组件:`)
console.log(
  `   import { ${componentName} } from 'src/view/component/${kebabCaseName}/${kebabCaseName}'`,
)
