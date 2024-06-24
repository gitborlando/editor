import { ISchema } from 'src/editor/schema/type'
import { FileManager } from '../file-manager'
import mock100000test from './json/10000test.json'
import { mockNested2 } from './nested2'

const mockFiles = [mockNested2(), mock100000test as ISchema]

export async function mockFile(force?: boolean) {
  for (const file of mockFiles) {
    if (await FileManager.fileForage.getItem(file.meta.fileId)) continue
    await FileManager.fileForage.setItem(file.meta.fileId, file)
  }
}
