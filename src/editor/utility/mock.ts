import { v4 } from 'uuid'
import { XY } from '../math/xy'
import { SchemaDefaultService } from '../schema/default'
import { INode } from '../schema/type'

export const mockJsonFile = mockJsonFile3

const mockFileJson1 = (schemaDefault: SchemaDefaultService) => ({
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

export function mockJsonFile2(schemaDefault: SchemaDefaultService) {
  let s = new Date().getTime()
  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 10000; i++) {
    const id = v4()
    let j = i % 100

    k = ~~(i / 100)
    const triangle = schemaDefault.triangle({
      id,
      width: 100,
      height: 100,
      x: 0 + j * 101,
      y: 0 + k * 101,
      radius: 10,
      parentId: 'page1',
      fill: 'skyBlue', //'#CCCCCC',
    })
    nodes[id] = triangle
  }
  console.log('mock time: ', new Date().getTime() - s)
  return {
    meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
    nodes,
    pages: [
      {
        id: v4(),
        name: '测试页面1',
        zoom: 0.05,
        offset: { x: 0, y: 0 },
        childIds: Object.keys(nodes),
      },
    ],
  }
}

export function mockJsonFile3(schemaDefault: SchemaDefaultService) {
  const nodes: Record<string, INode> = {
    rect2: schemaDefault.rect({
      id: 'rect2',
      name: '测试矩形1',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),

    line1: schemaDefault.line({
      id: 'line1',
      name: '测试线段1',
      height: 1,
      start: XY.Of(300, 0),
      end: XY.Of(400, 100),
      parentId: 'page1',
    }),
    triangle1: schemaDefault.triangle({
      id: 'triangle1',
      width: 100,
      height: 100,
      x: 200,
      parentId: 'page1',
    }),
  }

  return {
    meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
    nodes,
    pages: [
      {
        id: v4(),
        name: '测试页面1',
        zoom: 1,
        offset: { x: 0, y: 0 },
        childIds: Object.keys(nodes),
      },
    ],
  }
}
