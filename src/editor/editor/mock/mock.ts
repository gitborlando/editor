import { ISchema } from 'src/editor/schema/type'
import { FileManager } from '../file-manager'
import { mock10000Nested } from './10000nested'
import { mock10000Rect } from './10000rect'
import mock100000test from './json/10000test.json'
import { mockNested2 } from './nested2'

const mockFiles = [mockNested2(), mock10000Nested(), mock10000Rect(), mock100000test as ISchema]

export async function mockFile(force?: boolean) {
  for (const file of mockFiles) {
    if (await FileManager.fileForage.getItem(file.meta.fileId)) continue
    await FileManager.fileForage.setItem(file.meta.fileId, file)
  }
}
