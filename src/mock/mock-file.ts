import { SchemaFile } from '~/editor/editor/file'
import { IMeta, ISchema } from '~/editor/schema/type'
import { mock10000Nested } from './10000nested'
import { mockNested } from './nested'
import { mockNested2 } from './nested2'

const allFileMeta = <IMeta[]>[]
const mockFiles = [mockNested2(), mockNested(), mock10000Nested()]

export function mockFile() {
  mockFiles.forEach((file) => {
    SchemaFile.fileStore.set(file.meta.fileId, file)
    allFileMeta.push(file.meta)
  })
  SchemaFile.allFileMetaStore.set('allFileMeta', allFileMeta)
  SchemaFile.allFileMeta.dispatch((all) => all.push(...allFileMeta))
}

export function getMockFile(id: string) {
  return mockFiles.find((file) => file.meta.fileId === id) as ISchema
}
