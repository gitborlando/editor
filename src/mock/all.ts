import { nanoid } from 'nanoid'
import { SchemaDefaultService } from '~/editor/schema/default'
import { INode } from '~/editor/schema/type'
import { XY } from '~/shared/structure/xy'

export function mockAll(schemaDefault: SchemaDefaultService) {
  const [x, y, width, height] = [100, 0, 100, 100]
  const nodes: Record<string, INode> = {
    frame1: schemaDefault.frame({
      id: 'frame1',
      name: '测试画板1',
      width: 500,
      height: 500,
      x: 600,
      centerX: 850,
      centerY: 250,
      parentId: 'page1',
    }),
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
    }),
    rect3: schemaDefault.rect({
      id: 'rect3',
      name: '测试矩形1',
      width: 200,
      height: 200,
      x: 250,
      centerX: 300,
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
      x: 300,
      y: 400,
      centerX: 250,
      centerY: 250,
      parentId: 'page1',
    }),
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
        id: nanoid(),
        name: '测试页面1',
        zoom: 1,
        offset: { x: 100, y: 100 },
        childIds: Object.keys(nodes),
      },
    ],
  }
}
