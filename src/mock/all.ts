import { xy_new } from '~/editor/math/xy'
import { SchemaDefault } from '~/editor/schema/default'
import { ISchema } from '~/editor/schema/type'

export function mockAll() {
  const [x, y, width, height] = [100, 0, 100, 100]
  const nodes: ISchema['nodes'] = {
    'page:1': {
      frame1: SchemaDefault.frame({
        id: 'frame1',
        name: '测试画板1',
        width: 500,
        height: 500,
        x: 600,
        centerX: 850,
        centerY: 250,
        parentId: 'page:1',
      }),
      rect2: SchemaDefault.rect({
        id: 'rect2',
        name: '测试矩形1',
        width: 100,
        height: 100,
        x: 100,
        centerX: 150,
        centerY: 50,
        parentId: 'page:1',
      }),
      rect7: SchemaDefault.rect({
        id: 'rect7',
        name: '测试矩形1',
        width: 100,
        height: 100,
        x: 300,
        centerX: 350,
        centerY: 50,
        parentId: 'page:1',
      }),
      rect10: SchemaDefault.rect({
        id: 'rect10',
        name: '测试矩形1',
        width: 200,
        height: 100,
        x: 100,
        y: 100,
        centerX: 200,
        centerY: 150,
        parentId: 'page:1',
      }),
      rect3: SchemaDefault.rect({
        id: 'rect3',
        name: '测试矩形1',
        width: 200,
        height: 200,
        x: 250,
        centerX: 300,
        parentId: 'page:1',
      }),
      line1: SchemaDefault.line({
        id: 'line1',
        name: '测试线段1',
        height: 1,
        start: xy_new(300, 0),
        end: xy_new(400, 100),
        parentId: 'page:1',
      }),
      polygon1: SchemaDefault.polygon({
        id: 'polygon1',
        width: 100,
        height: 100,
        x: 300,
        y: 400,
        centerX: 250,
        centerY: 250,
        parentId: 'page:1',
      }),
      // irregular1: SchemaDefault.star({
      //   id: 'irregular1',
      //   width: 100,
      //   height: 100,
      //   x: 500,
      //   centerX: 525,
      //   points: [
      //     SchemaDefault.createPoint(500, 0, 'no-bezier', 0,xy_new(400, 0)),
      //     SchemaDefault.createPoint(500, 0, 'no-bezier', 0),
      //     SchemaDefault.createPoint(500, 100, 'no-bezier', 0, undefined,xy_new(400, 100)),
      //   ],
      //   parentId: 'page:1',
      // }),
    },
  }

  return <ISchema>{
    meta: { id: 'testFile3', name: '测试文件3', user: 'myself', version: 0 },
    nodes,
    pages: [
      {
        id: 'page:1',
        name: '测试页面1',
        zoom: 1,
        x: 100,
        y: 100,
        childIds: Object.keys(nodes['page:1']),
      },
    ],
  }
}
