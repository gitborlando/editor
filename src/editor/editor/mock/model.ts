import { SchemaCreate } from 'src/editor/schema/create'
import { ISchema } from 'src/editor/schema/type'

export function schemaModel() {
  const schema = <ISchema>{}

  const meta = SchemaCreate.meta()
  const client = SchemaCreate.client()
  const page = SchemaCreate.page()

  const star = SchemaCreate.star()

  schema.meta = meta
  schema.client = client

  schema[star.id] = star
  schema[`page_${page.id}`] = page

  page.childIds.push(star.id)
  meta.pageIds.push(page.id)

  return schema
}
