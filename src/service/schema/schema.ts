import autoBind from 'auto-bind'
import { makeAutoObservable, toJS } from 'mobx'
import { ISchema } from '~/service/schema/type'
import { EditorService } from '../editor/editor'
import { DefaultSchema } from './default'

export class SchemaService {
  Default: DefaultSchema
  schemaMap = new Map<string, ISchema>()
  selectedSchemas: ISchema[] = []
  constructor(public editor: EditorService) {
    autoBind(this)
    makeAutoObservable(this)
    this.Default = new DefaultSchema(this)
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'l') console.log({ ...this.getSchemaMap() })
    })
  }
  getSchemaMap() {
    const o: Record<string, ISchema> = {}
    ;[...this.schemaMap.entries()].forEach(([k, v]) => {
      o[k] = toJS(v)
    })
    return o
  }
  setSchemaMap(schemaObj: Record<string, ISchema>) {
    Object.entries(schemaObj).forEach(([id, schema]) => this.schemaMap.set(id, schema))
  }
  getSchemaFlat() {
    return [...this.schemaMap.values()]
  }
  addSchema(schema: ISchema) {
    this.schemaMap.set(schema.id, schema)
    return this.schemaMap.get(schema.id)!
  }
  deleteSchema(id: string) {
    this.schemaMap.delete(id)
  }
  copySchema() {}
  findSchema(id: string) {
    return this.schemaMap.get(id)
  }
  findSchemaThen(id: string, callback: (schema: ISchema) => void) {
    const schema = this.findSchema(id)
    schema && callback(schema)
  }
}
