import { SchemaCreate } from 'src/editor/schema/create'
import { ISchema } from 'src/editor/schema/type'

export function mockPolyline() {
  const schema = <ISchema>{}

  const meta = SchemaCreate.meta()
  const client = SchemaCreate.client()
  const page = SchemaCreate.page()

  const star = SchemaCreate.star()

  star.points = [
    SchemaCreate.point({ x: 0, y: 0, startPath: true }),
    SchemaCreate.point({ x: 20, y: 90 }),
    SchemaCreate.point({ x: 40, y: 60 }),
    SchemaCreate.point({ x: 90, y: 10, endPath: true }),
  ]
  star.fills = []
  star.strokes = [SchemaCreate.stroke()]

  schema.meta = meta
  schema.client = client

  schema[star.id] = star
  schema[page.id] = page

  page.childIds.push(star.id)
  meta.pageIds.push(page.id)
  client.selectPageId = page.id

  console.log(schema)
  return schema
}
