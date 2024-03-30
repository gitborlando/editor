import { SchemaDefaultService } from '~/editor/schema/default'
import { ISchema } from '~/editor/schema/type'

export function mockList(schemaDefault: SchemaDefaultService) {
  const nodes: ISchema['nodes'] = {
    'page:1': {},
  }
  // const frames = new Array(3).fill('').map((i) => nanoid())
  const frames = new Array(30).fill('').map((_, i) => '画板' + (i + 1))
  frames.forEach((frameId, i) => {
    i = i + 1
    const rect = schemaDefault.rect({
      id: '矩形' + i,
      // id: nanoid(),
      width: 100,
      height: 100,
      x: 100,
      centerX: 100 * i + 50,
      centerY: 50,
      parentId: frameId,
    })
    const triangle = schemaDefault.polygon({
      id: '多边形' + i,
      // id: nanoid(),
      width: 100,
      height: 100,
      x: 200,
      y: 300,
      centerX: 200 * i + 50,
      centerY: 150,
      parentId: frameId,
    })
    const frame = schemaDefault.frame({
      id: frameId,
      width: 400,
      height: 400,
      x: 400 * i + 50,
      centerX: 100 * i + 200,
      centerY: 200,
      parentId: 'page:1',
      childIds: [rect.id, triangle.id],
    })
    nodes['page:1'][frame.id] = frame
    nodes['page:1'][rect.id] = rect
    nodes['page:1'][triangle.id] = triangle
  })

  return <ISchema>{
    meta: { id: 'testFile2', name: '测试文件2', user: 'myself', version: 0 },
    nodes,
    pages: [
      {
        id: 'page:1',
        name: '测试页面1',
        zoom: 1,
        x: 100,
        y: 100,
        childIds: frames,
      },
    ],
  }
}
