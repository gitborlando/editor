import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import localforage from 'localforage'
import { Uploader } from 'src/global/upload'
import { createSignal } from 'src/shared/signal/signal'
import { OperateNode } from '../operate/node'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { IMeta, ISchema } from '../schema/type'
import { editorSettings } from './settings'

@autobind
class FileManagerService {
  fileForage = localforage.createInstance({ name: 'editor-files' })
  isSaved$ = createSignal(false)
  fileMetaList$ = createSignal<IMeta[]>([])
  init() {
    this.debug()
    this.autoSave()
  }
  initHook() {}
  async getFileMetaList() {
    this.fileMetaList$.value = []
    const keys = await this.fileForage.keys()
    for (const key of keys) {
      this.fileMetaList$.value.push((await this.fileForage.getItem<ISchema>(key))!.meta)
    }
    this.fileMetaList$.dispatch()
  }
  autoSave() {
    setInterval(async () => {
      if (!editorSettings.autosave) return
      await this.saveJsonFile(Schema.schema)
      this.isSaved$.dispatch(true)
    }, 1000)
  }
  async openFile() {
    const file = await Uploader.open({ accept: '' })
    if (!file) return
    const json = JSON.parse(await Uploader.readAsText(file))
    //  this.loadJsonFile(json)
  }
  async newFile() {
    const schema = SchemaDefault.schema()
    await this.saveJsonFile(schema)
    this.openInNewTab(schema.meta.fileId)
    this.getFileMetaList()
  }
  async deleteFile(id: string) {
    if (id === Schema.meta.fileId) return
    await this.fileForage.removeItem(id)
    this.getFileMetaList()
  }
  async saveJsonFile(json: ISchema) {
    await this.fileForage.setItem(json.meta.fileId, json)
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

export const FileManager = new FileManagerService()
