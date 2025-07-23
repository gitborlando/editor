import { SchemaDefault } from 'src/editor/schema/default'
import { ISchema } from 'src/editor/schema/type'

export function mockPolyline() {
  const schema = <ISchema>{}

  const meta = SchemaDefault.meta()
  const client = SchemaDefault.client()
  const page = SchemaDefault.page()

  const star = SchemaDefault.star()

  star.points = [
    SchemaDefault.point({ x: 0, y: 0, startPath: true }),
    SchemaDefault.point({ x: 20, y: 90 }),
    SchemaDefault.point({ x: 40, y: 60 }),
    SchemaDefault.point({ x: 90, y: 10, endPath: true }),
  ]
  star.fills = []
  star.strokes = [SchemaDefault.stroke()]

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
