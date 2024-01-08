import { mockJsonFile } from '~/mock/mock'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { SchemaDefault } from './schema/default'
import { SchemaPage } from './schema/page'
import { Schema } from './schema/schema'
import { ISchema } from './schema/type'

@autobind
export class FileService {
  afterOpenFile = createSignal<File>()
  private inputRef!: HTMLInputElement
  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!(e.altKey && e.key === 'l')) return
      console.log(Schema.getSchema())
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
    this.afterOpenFile.dispatch(file)
    const json = JSON.parse(await this.readAsText(file))
    Schema.setSchema(json)
    SchemaPage.select(json.pages[0].id)
  }
  newFile() {
    const json = SchemaDefault.schema()
    Schema.setSchema(json)
    SchemaPage.select(json.pages[0].id)
  }
  async mockFile() {
    return new Promise<ISchema>((resolve) => {
      setTimeout(() => {
        const json = mockJsonFile(SchemaDefault)
        resolve(json)
      })
    })
  }
  exportFile() {
    console.log(Schema.getSchema())
    localStorage.setItem('file', JSON.stringify(Schema.getSchema()))
    this.downloadJsonFile(Schema.getSchema())
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

export const File = new FileService()
