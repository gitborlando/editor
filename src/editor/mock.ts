import { v4 } from 'uuid'
import { SchemaDefaultService } from './schema/default'
import { INode } from './schema/type'

export const mockFileJson = (schemaDefault: SchemaDefaultService) => ({
  meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
  nodes: {
    frame1: schemaDefault.frame({
      id: 'ellipse1',
      parentId: 'page1',
      width: 500,
      height: 500,
      x: 100,
      childIds: ['rect2'],
    }),
    ellipse1: schemaDefault.ellipse({
      id: 'ellipse1',
      parentId: 'page1',
      width: 200,
      height: 100,
      x: 100,
    }),
    rect2: schemaDefault.rect({
      id: 'rect2',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),
    rect4: schemaDefault.rect({
      id: 'rect4',
      width: 200,
      height: 100,
      x: 100,
      radius: 10,
      parentId: 'page1',
      fill: 'skyblue',
    }),
    rect3: schemaDefault.rect({
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
      // childIds: ['ellipse1'],
      childIds: ['frame1', 'rect4'],
    },
    {
      id: 'page2',
      name: '测试页面2',
      childIds: ['rect3'],
    },
  ],
})

export function mock2(schemaDefault: SchemaDefaultService) {
  let s = new Date().getTime()
  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 1000; i++) {
    const id = v4()
    let j = i % 100

    k = ~~(i / 100)
    const rect = schemaDefault.rect({
      id,
      width: 100,
      height: 100,
      x: 0 + j * 101,
      y: 0 + k * 101,
      radius: 10,
      parentId: 'page1',
      fill: '#CCCCCC',
    })
    nodes[id] = rect
  }
  console.log('mock time: ', new Date().getTime() - s)
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
