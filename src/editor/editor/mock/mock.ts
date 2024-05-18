import { Storage } from '~/global/storage'
import { FileManager } from '../file-manager'
import { mock10000Nested } from './10000nested'
import { mockNested } from './nested'
import { mockNested2 } from './nested2'

const mockFiles = [mockNested2(), mockNested(), mock10000Nested()]

export async function mockFile() {
  if (Storage.get('mockFile')) return
  for (const file of mockFiles) {
    await FileManager.fileForage.setItem(file.meta.fileId, file)
  }
  Storage.set('mockFile', true)
}