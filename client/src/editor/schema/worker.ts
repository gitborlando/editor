import localforage from 'localforage'
import { ISchema } from 'src/editor/schema/type'
import Immui from 'src/shared/immui/immui'

let schema!: ISchema
let fileId!: string

const fileStorage = localforage.createInstance({ name: 'editor-files' })

const immui = new Immui()

onmessage = async (e) => {
  if (e.data.fileId) {
    fileId = e.data.fileId
    schema = (await fileStorage.getItem<ISchema>(fileId))!
  } else {
    const { patches, reverse } = e.data
    immui.applyPatches(schema, patches, { reverse })
    fileStorage.setItem(fileId, schema)
  }
}
