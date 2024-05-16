import { xy_ } from '~/editor/math/xy'
import { SchemaDefault } from '~/editor/schema/default'
import { IFillLinearGradient, ISchema } from '~/editor/schema/type'
import { COLOR } from '~/shared/utils/color'

export function mockNested() {
  const [x, y, width, height] = [100, 0, 100, 100]
  const LinearGradient = <IFillLinearGradient>{
    type: 'linearGradient',
    start: xy_(0, 0),
    end: xy_(1, 1),
    stops: [
      { offset: 0, color: COLOR.blue },
      { offset: 1, color: COLOR.pinkRed },
    ],
    alpha: 1,
    visible: true,
  }
  return <ISchema>{
    meta: {
      type: 'meta',
      id: 'meta',
      fileId: 'test-file-2',
      name: '测试文件2',
      version: 0,
      pageIds: ['page_1'],
      clients: {},
    },
    page_1: {
      type: 'page',
      id: 'page_1',
      name: '测试页面1',
      zoom: 1,
      x: 100,
      y: 100,
      childIds: ['frame:1'],
    },

    // frame0: schemaDefault.frame({
    //   id: 'frame0',
    //   name: '测试画板0',
    //   width: 500,
    //   height: 500,
    //   x: 0,
    //   centerX: 250,
    //   centerY: 250,
    //   parentId: 'frame:1',
    //   childIds: ['frame:1'],
    // }),
    'frame:1': SchemaDefault.frame({
      id: 'frame:1',
      name: '测试画板1',
      width: 400,
      height: 400,
      x: 0,
      parentId: 'page:1',
      childIds: ['text2', 'triangle1', 'line1', /* 'rect2', */ 'rect3'],
    }),
    // rect2: SchemaDefault.rect({
    //   id: 'rect2',
    //   name: '测试矩形1',
    //   width: 100,
    //   height: 100,
    //   x: 0,
    //   centerX: 50,
    //   centerY: 50,
    //   parentId: 'frame:1',
    //   // rotation: 30,
    //   strokes: [SchemaDefault.stroke()],
    // }),
    text2: SchemaDefault.text({
      id: 'text2',
      name: '测试文本1',
      width: 100,
      height: 100,
      x: 0,
      parentId: 'frame:1',
      // rotation: 30,
      // strokes: [SchemaDefault.stroke()],
    }),
    rect3: SchemaDefault.rect({
      id: 'rect3',
      name: '测试矩形3',
      width: 200,
      height: 200,
      x: 100,
      parentId: 'frame:1',
      fills: [LinearGradient],
      shadows: [SchemaDefault.shadow()],
    }),
    triangle1: SchemaDefault.polygon({
      id: 'triangle1',
      width: 100,
      height: 100,
      // x: 100,
      // centerX: 150,
      // centerY: 50,
      x: 200,
      y: 300,
      fills: [SchemaDefault.fillColor(COLOR.pinkRed)],
      parentId: 'frame:1',
    }),
    line1: SchemaDefault.line({
      id: 'line1',
      width: 100,
      height: 0,
      x: 400,
      y: 400,
      strokes: [SchemaDefault.stroke()],
      parentId: 'frame:1',
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
}
