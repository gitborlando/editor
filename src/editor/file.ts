//@ts-ignore
import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { Uploader } from '~/global/upload'
import { createIDBStore } from '~/shared/idb-store'
import { createSignal } from '~/shared/signal/signal'
import { Delete } from '~/shared/utils/normal'
import { OperateNode } from './operate/node'
import { SchemaDefault } from './schema/default'
import { Schema } from './schema/schema'
import { IMeta, ISchema } from './schema/type'

@autobind
class SchemaFileService {
  fileStore = createIDBStore<ISchema>('schema-files')
  isSaved = createSignal(false)
  allFileMeta = createSignal(<IMeta[]>[])
  allFileMetaStore = createIDBStore<IMeta[]>('allFileMeta')
  init() {
    this.debug()
    this.autoSave()
  }
  initHook() {
    this.allFileMeta.hook((allMeta) => {
      this.allFileMetaStore.set('allFileMeta', allMeta)
    })
  }
  async getAllFileMeta() {
    const allFileMeta = await this.allFileMetaStore.get('allFileMeta')
    this.allFileMeta.dispatch(allFileMeta)
  }
  // loadJsonFile(json: ISchema) {
  //   Schema.setSchema(json)
  // }
  autoSave() {
    setInterval(() => {
      if (import.meta.env.DEV && Schema.schema.meta.id.match('testFile')) return
      this.saveJsonFile(Schema.schema)
      this.isSaved.dispatch(true)
    }, 1000)
  }
  async openFile() {
    const file = await Uploader.open({ accept: '' })
    if (!file) return
    const json = JSON.parse(await Uploader.readAsText(file))
    //  this.loadJsonFile(json)
  }
  newFile() {
    const schema = SchemaDefault.schema()
    this.allFileMeta.dispatch((allMeta) => allMeta.push(schema.meta))
    this.fileStore.set(schema.meta.id, schema)
    this.openInNewTab(schema.meta.id)
  }
  deleteFile(id: string) {
    this.allFileMeta.dispatch((allMeta) => Delete(allMeta, (meta) => meta.id === id))
    this.fileStore.delete(id)
  }
  saveJsonFile(json: ISchema) {
    this.fileStore.set(json.meta.id, json)
  }
  downloadJsonFile(data: object): void {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    Uploader.download(blob)
  }
  openInNewTab(id: string) {
    window.open(`${location.href.split('#')[0]}#${id}`)
  }
  private debug() {
    hotkeys('alt+l', () => {
      if (OperateNode.selectIds.value.size) {
        OperateNode.selectIds.value.forEach((id) => {
          console.log(Schema.find(id))
        })
      } else {
        console.log(Schema.schema)
      }
    })
  }
}

export const SchemaFile = new SchemaFileService()
