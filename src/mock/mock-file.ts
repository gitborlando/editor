import { SchemaFile } from '~/editor/file'
import { SchemaDefaultService } from '~/editor/schema/default'
import { IMeta, ISchema } from '~/editor/schema/type'
import { mockAll } from './all'
import { mockList } from './list'
import { mockJsonFile3 } from './mock'
import { mockNested } from './nested'

const allFileMeta = <IMeta[]>[]

export function mockFile(schemaDefault: SchemaDefaultService) {
  setupMock(mockNested(schemaDefault))
  setupMock(mockList(schemaDefault))
  setupMock(mockAll(schemaDefault))
  setupMock(mockJsonFile3(schemaDefault))
  SchemaFile.allFileMetaStore.set('allFileMeta', allFileMeta)
}

export function setupMock(schema: ISchema) {
  SchemaFile.fileStore.set(schema.meta.id, schema)
  allFileMeta.push(schema.meta)
}
