import { writeFileSync } from 'fs'
import path from 'path'
import { parse } from 'svg-parser'
import { fileURLToPath } from 'url'

const parsed = parse(`
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="216.23065185546875" height="212.7095947265625" viewBox="0 0 216.23065185546875 212.7095947265625" fill="none">
<path d="M106.031 204.708L128.18 121.163L208.229 103.288L7.53156 7.53088L106.031 204.708Z" stroke="rgba(0, 13, 255, 1)" stroke-width="16" stroke-linejoin="round"  >
</path>
</svg>

`)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '')
writeFileSync(path.resolve(rootDir, 'parsed.json'), JSON.stringify(parsed, null, 2))
