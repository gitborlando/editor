import { SchemaDefault } from 'src/editor/schema/default'
import { ISchema } from 'src/editor/schema/type'

export function schemaModel() {
  const schema = <ISchema>{}

  const meta = SchemaDefault.meta()
  const client = SchemaDefault.client()
  const page = SchemaDefault.page()

  const star = SchemaDefault.star()

  schema.meta = meta
  schema.client = client

  schema[star.id] = star
  schema[`page_${page.id}`] = page

  page.childIds.push(star.id)
  meta.pageIds.push(page.id)

  return schema
}
