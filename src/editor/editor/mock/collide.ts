import { SchemaCreate } from 'src/editor/schema/create'

export function mockCollide() {
  const schema = <V1.Schema>{}

  const meta = SchemaCreate.meta()
  const page = SchemaCreate.page()
  schema.meta = meta

  schema[page.id] = page
  meta.pageIds.push(page.id)

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
