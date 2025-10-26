import { SchemaCreator } from 'src/editor/schema/create'
import { ISchema } from 'src/editor/schema/type'

export function schemaModel() {
  const schema = <ISchema>{}

  const meta = SchemaCreator.meta()
  const client = SchemaCreator.client()
  const page = SchemaCreator.page()

  const star = SchemaCreator.star()

  schema.meta = meta
  schema.client = client

  schema[star.id] = star
  schema[`page_${page.id}`] = page

  page.childIds.push(star.id)
  meta.pageIds.push(page.id)

  return schema
}
