import { v4 } from 'uuid'
import { SchemaService } from '~/editor/schema/schema'
import { INode } from '~/editor/schema/type'

export const mockFileJson = (schema: SchemaService) => ({
  meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
  nodes: {
    ellipse1: schema.default.ellipse({
      id: 'ellipse1',
      parentId: 'page1',
      width: 200,
      height: 100,
      x: 100,
    }),
    rect2: schema.default.rect({
      id: 'rect2',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),
    rect4: schema.default.rect({
      id: 'rect4',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),
    rect3: schema.default.rect({
      id: 'rect3',
      width: 200,
      height: 200,
      x: 200,
      parentId: 'page2',
    }),
  },
  pages: [
    {
      id: 'page1',
      name: '测试页面1',
      // childIds: ['ellipse1' ,  'rect2' , 'rect4'],
      childIds: ['ellipse1'],
    },
    {
      id: 'page2',
      name: '测试页面2',
      childIds: ['rect3'],
    },
  ],
})

export function mock2(schema: SchemaService) {
  let s = new Date().getTime()
  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 10000; i++) {
    const id = v4()
    let j = i % 50

    k = ~~(i / 50)
    const rect = schema.default.rect({
      id,
      width: 50,
      height: 50,
      x: 0 + j * 55,
      y: 0 + k * 55,
      radius: 10,
      parentId: 'page1',
      // fill: 'skyblue',
    })
    nodes[id] = rect
  }
  console.log(new Date().getTime() - s)
  return {
    meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
    nodes,
    pages: [
      {
        id: 'page1',
        name: '测试页面1',
        childIds: Object.keys(nodes),
      },
    ],
  }
}
