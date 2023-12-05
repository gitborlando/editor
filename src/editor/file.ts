import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { mockJsonFile } from '~/editor/utility/mock'
import { EditorService } from './editor'
import { SchemaDefaultService, injectSchemaDefault } from './schema/default'
import { SchemaPageService, injectSchemaPage } from './schema/page'
import { SchemaService, injectSchema } from './schema/schema'

@autobind
@injectable()
export class FileService {
  private inputRef!: HTMLInputElement
  constructor(
    @injectSchema private schemaService: SchemaService,
    @injectSchemaPage private schemaPageService: SchemaPageService,
    @injectSchemaDefault private schemaDefaultService: SchemaDefaultService,
    @inject(delay(() => EditorService)) private editorService: EditorService
  ) {
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') console.log(this.schemaService.getSchema())
    })
  }
  setInputRef(input: HTMLInputElement) {
    this.inputRef = input
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
  }
  newFile() {
    const json = this.schemaDefaultService.schema()
    this.schemaService.setSchema(json)
    this.schemaPageService.select(json.pages[0].id)
  }
  mockFile() {
    const json = mockJsonFile(this.schemaDefaultService)
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

export const injectFile = inject(FileService)
