import { SchemaDefault } from 'src/editor/schema/default'
import { ISchema } from 'src/editor/schema/type'

export function mockCollide() {
  const schema = <ISchema>{}

  const meta = SchemaDefault.meta()
  const client = SchemaDefault.client()
  const page = SchemaDefault.page()
  schema.meta = meta
  schema.client = client

  schema[page.id] = page
  meta.pageIds.push(page.id)
  client.selectPageId = page.id

  const frame = SchemaDefault.frame()
  frame.x = 100
  frame.y = 100
  frame.width = 500
  frame.height = 500
  schema[frame.id] = frame
  page.childIds.push(frame.id)

  for (let i = 0; i < 3; i++) {
    const rect = SchemaDefault.rect()
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
