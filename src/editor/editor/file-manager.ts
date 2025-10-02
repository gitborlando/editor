import autobind from 'class-autobind-decorator'
import localforage from 'localforage'
import { Uploader } from 'src/global/upload'
import { createSignal } from 'src/shared/signal/signal'
import { jsonFy, jsonParse } from 'src/shared/utils/normal'
import { Schema } from '../schema/schema'
import { IMeta, ISchema } from '../schema/type'

@autobind
class FileManagerService {
  fileForage = localforage.createInstance({ name: 'editor-files' })
  isSaved$ = createSignal(false)
  fileMetaList$ = createSignal<IMeta[]>([])

  async getFileMetaList() {
    const mockList = [] as IMeta[]
    this.fileMetaList$.value = [...mockList]
    const keys = await this.fileForage.keys()
    for (const key of keys) {
      if (mockList.some((meta) => meta.fileId === key)) continue
      this.fileMetaList$.value.push((await this.fileForage.getItem<ISchema>(key))!.meta)
    }
    this.fileMetaList$.dispatch()
  }

  async openFile() {
    const file = await Uploader.open({ accept: '' })
    const json = jsonParse(await Uploader.readAsText(file!)) as ISchema
    await this.addNewFile(json)
  }

  async addNewFile(schema: ISchema) {
    await this.saveFile(schema)
    this.openInNewTab(schema.meta.fileId)
    this.getFileMetaList()
  }

  async deleteFile(id: string) {
    if (id === Schema.meta.fileId) return
    await this.fileForage.removeItem(id)
    this.getFileMetaList()
  }

  async saveFile(schema: ISchema) {
    await this.fileForage.setItem(schema.meta.fileId, schema)
  }

  async exportFile(fileId: string) {
    const json = await this.fileForage.getItem<ISchema>(fileId)
    const blob = new Blob([jsonFy(json)!], { type: 'application/json' })
    Uploader.download(blob)
  }

  openInNewTab(id: string) {
    window.open(`${location.href.split('#')[0]}#${id}`)
  }
}

export const FileManager = new FileManagerService()
