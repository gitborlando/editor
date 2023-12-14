import { v4 } from 'uuid'
import { SchemaDefaultService } from './schema/default'
import { INode } from './schema/type'

export const mockJsonFile = mockJsonFile3

export function mockJsonFile2(schemaDefault: SchemaDefaultService) {
  let s = new Date().getTime()
  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 10000; i++) {
    const id = v4()
    let j = i % 100

    k = ~~(i / 100)
    let size = 100
    let node: any = schemaDefault.rect({
      id,
      width: size,
      height: size,
      x: 0 + j * (size + 30),
      y: 0 + k * (size + 30),
      centerX: 50 + j * (size + 30),
      centerY: 50 + k * (size + 30),
      radius: 10,
      parentId: 'page1',
      fill: 'skyBlue', //'#CCCCCC',
    })
    // node = schemaDefault.star({
    //   id,
    //   x: 0 + j * 101,
    //   y: 0 + k * 101,
    //   pivotX: 0 + j * 101,
    //   pivotY: 0 + k * 101,
    //   centerX: 50 + j * 101,
    //   centerY: 50 + k * 101,
    //   points: [
    //     schemaDefault.createPoint(-50, -50, 'no-bezier', 0, XY.Of(-100, -50)),
    //     schemaDefault.createPoint(50, 0, 'no-bezier', 0),
    //     schemaDefault.createPoint(-50, 50, 'no-bezier', 0, undefined, XY.Of(-100, 50)),
    //   ],
    //   parentId: 'page1',
    // })
    nodes[id] = node
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
  const [x, y, width, height] = [100, 0, 100, 100]
  const nodes: Record<string, INode> = {
    rect2: schemaDefault.rect({
      id: 'rect2',
      name: '测试矩形1',
      width: 100,
      height: 100,
      x: 100,
      centerX: 150,
      centerY: 50,
      parentId: 'page1',
    }),
    rect7: schemaDefault.rect({
      id: 'rect7',
      name: '测试矩形1',
      width: 100,
      height: 100,
      x: 300,
      centerX: 350,
      centerY: 50,
      parentId: 'page1',
    }),
    rect10: schemaDefault.rect({
      id: 'rect10',
      name: '测试矩形1',
      width: 200,
      height: 100,
      x: 100,
      y: 100,
      centerX: 200,
      centerY: 150,
      parentId: 'page1',
      fill: 'skyblue',
    }),
    // rect3: schemaDefault.rect({
    //   id: 'rect3',
    //   name: '测试矩形1',
    //   width: 200,
    //   height: 200,
    //   x: 250,
    //   centerX: 300,
    //   parentId: 'page1',
    // }),
    // line1: schemaDefault.line({
    //   id: 'line1',
    //   name: '测试线段1',
    //   height: 1,
    //   start: XY.Of(300, 0),
    //   end: XY.Of(400, 100),
    //   parentId: 'page1',
    // }),
    // triangle1: schemaDefault.triangle({
    //   id: 'triangle1',
    //   width: 100,
    //   height: 100,
    //   x: 300,
    //   y: 400,
    //   centerX: 250,
    //   centerY: 250,
    //   parentId: 'page1',
    // }),
    // irregular1: schemaDefault.star({
    //   id: 'irregular1',
    //   width: 100,
    //   height: 100,
    //   x: 500,
    //   centerX: 525,
    //   points: [
    //     schemaDefault.createPoint(500, 0, 'no-bezier', 0, XY.Of(400, 0)),
    //     schemaDefault.createPoint(500, 0, 'no-bezier', 0),
    //     schemaDefault.createPoint(500, 100, 'no-bezier', 0, undefined, XY.Of(400, 100)),
    //   ],
    //   parentId: 'page1',
    // }),
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
