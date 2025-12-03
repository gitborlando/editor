import { SchemaCreator } from 'src/editor/schema/creator'

export function mockCollide() {
  const schema = <V1.Schema>{}

  const meta = SchemaCreator.meta()
  const page = SchemaCreator.page()
  SchemaCreator.addToSchema(schema, meta)
  SchemaCreator.addToSchema(schema, page)
  meta.pageIds.push(page.id)

  const frame = SchemaCreator.frame()
  frame.x = 100
  frame.y = 100
  frame.width = 500
  frame.height = 500
  SchemaCreator.addToSchema(schema, frame)
  SchemaCreator.addChild(page, frame)

  // for (let i = 0; i < 3; i++) {
  //   const rect = SchemaCreator.rect()
  //   rect.x = 100 + i * 50
  //   rect.y = 100 + i * 50
  //   rect.width = 100
  //   rect.height = 100
  //   SchemaCreator.addToSchema(schema, rect)
  //   SchemaCreator.addChild(frame, rect)
  // }

  const line = SchemaCreator.line({
    x: 300,
    y: 300,
    rotation: 45,
  })
  SchemaCreator.addToSchema(schema, line)
  SchemaCreator.addChild(frame, line)

  // const polygon = SchemaCreator.polygon({
  //   x: 300,
  //   y: 300,
  //   width: 100,
  //   height: 100,
  //   sides: 8,
  // })
  // SchemaCreator.addToSchema(schema, polygon)
  // SchemaCreator.addChild(frame, polygon)

  return schema
}
