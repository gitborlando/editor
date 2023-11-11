import autoBind from 'auto-bind'
import { EditorService } from '../editor/editor'
import { SchemaService } from './schema'

export class SchemaFile {
  private _inputRef?: HTMLInputElement
  constructor(private schema: SchemaService, private editor: EditorService) {
    autoBind(this)
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') console.log(this.editor.schema.getSchema())
    })
  }
  get inputRef() {
    return this._inputRef!
  }
  setInputRef(input: HTMLInputElement) {
    this._inputRef = input
  }
  async openFile() {
    this.inputRef.click()
    const file = await new Promise<File | undefined>((resolve) => {
      this.inputRef.onchange = () => resolve(this.inputRef.files?.[0])
    })
    if (!file) return
    const json = JSON.parse(await this.readAsText(file))
    this.schema.setSchema(json)
    this.schema.page.select(json.pages[0].id)
  }
  newFile() {
    const json = this.editor.schema.default.schema()
    this.schema.setSchema(json)
    this.schema.page.select(json.pages[0].id)
  }
  mockFile() {
    const json = mockFileJson(this.editor)
    this.schema.setSchema(json)
    this.schema.page.select(json.pages[0].id)
  }
  exportFile() {
    console.log(this.editor.schema.getSchema())
    localStorage.setItem('file', JSON.stringify(this.editor.schema.getSchema()))
    this.downloadJsonFile(this.editor.schema.getSchema())
  }
  downloadJsonFile(data: object): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = '文件' + new Date().getTime()
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve((e.target?.result || '') as string)
      reader.onerror = (e) => reject(e.target?.error)
      reader.readAsText(file)
    })
  }
}

const mockFileJson = (editor: EditorService) => ({
  meta: { id: 'mock1', name: '测试文件1' },
  nodes: {
    rect1: editor.schema.default.rect({ id: 'rect1', parentId: 'page1' }),
    rect2: editor.schema.default.rect({
      id: 'rect1',
      width: 200,
      height: 200,
      x: 200,
      parentId: 'page2',
    }),
  },
  pages: [
    {
      id: 'page1',
      name: '测试页面1',
      childIds: ['rect1'],
    },
    {
      id: 'page2',
      name: '测试页面2',
      childIds: ['rect2'],
    },
  ],
})
