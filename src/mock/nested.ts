import { SchemaDefault, SchemaDefaultService } from '~/editor/schema/default'
import { ISchema } from '~/editor/schema/type'
import { COLOR } from '~/shared/utils/color'

export function mockNested(schemaDefault: SchemaDefaultService) {
  const [x, y, width, height] = [100, 0, 100, 100]
  const nodes: ISchema['nodes'] = {
    'page:1': {
      // frame0: schemaDefault.frame({
      //   id: 'frame0',
      //   name: '测试画板0',
      //   width: 500,
      //   height: 500,
      //   x: 0,
      //   centerX: 250,
      //   centerY: 250,
      //   parentId: 'frame1',
      //   childIds: ['frame1'],
      // }),
      frame1: schemaDefault.frame({
        id: 'frame1',
        name: '测试画板1',
        width: 400,
        height: 400,
        x: 0,
        centerX: 200,
        centerY: 200,
        parentId: 'page:1',
        childIds: ['rect2', 'triangle1'],
      }),
      rect2: schemaDefault.rect({
        id: 'rect2',
        name: '测试矩形1',
        width: 100,
        height: 100,
        x: 0,
        centerX: 50,
        centerY: 50,
        parentId: 'frame1',
        // rotation: 30,
        strokes: [SchemaDefault.stroke()],
      }),
      triangle1: schemaDefault.polygon({
        id: 'triangle1',
        width: 100,
        height: 100,
        // x: 100,
        // centerX: 150,
        // centerY: 50,
        x: 200,
        y: 300,
        centerX: 250,
        centerY: 350,
        fills: [schemaDefault.fillColor(COLOR.pinkRed)],
        parentId: 'frame1',
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
    },
  }

  return <ISchema>{
    meta: { id: 'mock1', name: '测试文件1', user: 'myself', version: 0 },
    nodes,
    pages: [
      {
        id: 'page:1',
        name: '测试页面1',
        zoom: 1,
        x: 100,
        y: 100,
        childIds: ['frame1'],
      },
    ],
  }
}
