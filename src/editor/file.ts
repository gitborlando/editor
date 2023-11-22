import { mock2 } from '~/editor/mock'
import { autoBind } from '~/helper/decorator'
import { EditorService } from './editor'
import { SchemaDefaultService } from './schema/default'
import { SchemaPageService } from './schema/page'
import { SchemaService } from './schema/schema'

@autoBind
export class FileService {
  private _inputRef?: HTMLInputElement
  constructor(
    private schemaService: SchemaService,
    private editorService: EditorService,
    private schemaPageService: SchemaPageService,
    private schemaDefaultService: SchemaDefaultService
  ) {
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') console.log(this.schemaService.getSchema())
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
    this.schemaService.setSchema(json)
    this.schemaPageService.select(json.pages[0].id)
    this.editorService.renderPage(json.pages[0].id)
  }
  newFile() {
    const json = this.schemaDefaultService.schema()
    this.schemaService.setSchema(json)
    this.schemaPageService.select(json.pages[0].id)
  }
  mockFile() {
    const json = /* mockFileJson */ mock2(this.schemaDefaultService)
    this.schemaService.setSchema(json)
    this.schemaPageService.select(json.pages[0].id)
  }
  exportFile() {
    console.log(this.schemaService.getSchema())
    localStorage.setItem('file', JSON.stringify(this.schemaService.getSchema()))
    this.downloadJsonFile(this.schemaService.getSchema())
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
