//@ts-ignore
import autobind from 'class-autobind-decorator'
import { Uploader } from '~/global/upload'
import { mockJsonFile } from '~/mock/mock'
import { createIDBStore } from '~/shared/idb-store'
import { createSignal } from '~/shared/signal'
import { SchemaDefault } from './schema/default'
import { SchemaNode } from './schema/node'
import { SchemaPage } from './schema/page'
import { Schema } from './schema/schema'
import { ISchema } from './schema/type'

type IFileDict = {
  [id: string]: IFileDict | string
}

const defaultFileName = 'defaultFileName'

@autobind
export class SchemaFileService {
  fileStore = createIDBStore<ISchema>('schema-files')
  fileDictStore = createIDBStore<IFileDict>('schema-file-dict')
  fileMetaStore = createIDBStore<ISchema['meta']>('schema-files-meta')
  isSaved = createSignal(false)
  init() {
    this.debug()
    this.autoSave()
  }
  async loadFile() {
    return await this.fileStore[defaultFileName]
  }
  autoSave() {
    setInterval(() => {
      this.saveFile()
      this.isSaved.dispatch(true)
    }, 1000 * 5)
  }
  async openFile() {
    const file = await Uploader.open({ accept: '' })
    if (!file) return
    const json = JSON.parse(await Uploader.readAsText(file))
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
  saveFile() {
    const schema = Schema.getSchema()
    this.fileStore[schema.meta.id] = schema
  }
  downloadJsonFile(data: object): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    Uploader.download(blob)
  }
  private debug() {
    window.addEventListener('keydown', (e) => {
      if (!(e.altKey && e.key === 'l')) return
      if (SchemaNode.selectIds.value.size) {
        SchemaNode.selectIds.value.forEach((id) => {
          console.log(SchemaNode.find(id))
        })
      } else {
        console.log(Schema.getSchema())
      }
    })
  }
}

export const SchemaFile = new SchemaFileService()
