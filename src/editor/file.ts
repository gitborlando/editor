//@ts-ignore
import { Upload } from '~/global/upload'
import { mockJsonFile } from '~/mock/mock'
import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { SchemaDefault } from './schema/default'
import { SchemaNode } from './schema/node'
import { SchemaPage } from './schema/page'
import { Schema } from './schema/schema'
import { ISchema } from './schema/type'

@autobind
export class SchemaFileService {
  isSaved = createSignal(false)
  init() {
    this.debug()
    this.autoSave()
  }
  autoSave() {
    setInterval(() => {
      const schema = Schema.getSchema()
      localStorage.setItem(schema.meta.id, JSON.stringify(schema))
      this.isSaved.dispatch(true)
    }, 1000 * 60 * 5)
  }
  async openFile() {
    const file = await Upload.open()
    if (!file) return
    const json = JSON.parse(await Upload.readAsText(file))
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
    const schema = Schema.getSchema()
    //this.store.set(schema.meta.id, JSON.stringify(schema))
    this.downloadJsonFile(Schema.getSchema())
  }
  downloadJsonFile(data: object): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    Upload.download(blob)
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
