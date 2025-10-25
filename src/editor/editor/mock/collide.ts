import { SchemaCreate } from 'src/editor/schema/create'
import { ISchema } from 'src/editor/schema/type'

export function mockCollide() {
  const schema = <ISchema>{}

  const meta = SchemaCreate.meta()
  const client = SchemaCreate.client()
  const page = SchemaCreate.page()
  schema.meta = meta
  schema.client = client

  schema[page.id] = page
  meta.pageIds.push(page.id)
  client.selectPageId = page.id

  const frame = SchemaCreate.frame()
  frame.x = 100
  frame.y = 100
  frame.width = 500
  frame.height = 500
  schema[frame.id] = frame
  page.childIds.push(frame.id)

  for (let i = 0; i < 3; i++) {
    const rect = SchemaCreate.rect()
    rect.x = 100 + i * 50
    rect.y = 100 + i * 50
    rect.width = 100
    rect.height = 100
    schema[rect.id] = rect
    frame.childIds.push(rect.id)
    rect.parentId = frame.id
  }

  return schema
}
