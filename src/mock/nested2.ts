import { xy_new } from '~/editor/math/xy'
import { SchemaDefault } from '~/editor/schema/default'
import { IFillLinearGradient, ISchema } from '~/editor/schema/type'
import { COLOR } from '~/shared/utils/color'

export function mockNested2() {
  const [x, y, width, height] = [100, 0, 100, 100]
  const LinearGradient = <IFillLinearGradient>{
    type: 'linearGradient',
    start: xy_new(0, 0),
    end: xy_new(1, 1),
    stops: [
      { offset: 0, color: COLOR.blue },
      { offset: 1, color: COLOR.pinkRed },
    ],
    alpha: 1,
    visible: true,
  }
  const schema: ISchema = {
    meta: {
      type: 'meta',
      id: 'meta',
      fileId: 'test-file-1',
      name: '测试文件1',
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
    'frame:1': SchemaDefault.frame({
      id: 'frame:1',
      name: '测试画板1',
      width: 400,
      height: 400,
      x: 0,
      y: 0,
      radius: 20,
      parentId: 'page_1',
      childIds: ['text2', 'triangle1', 'line1', /* 'rect2', */ 'rect3'],
    }),
    text2: SchemaDefault.text({
      id: 'text2',
      name: '测试文本1',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      parentId: 'frame:1',
    }),
    rect3: SchemaDefault.rect({
      id: 'rect3',
      name: '测试矩形3',
      width: 200,
      height: 200,
      x: 100,
      y: 0,
      parentId: 'frame:1',
      fills: [LinearGradient],
    }),
    triangle1: SchemaDefault.polygon({
      id: 'triangle1',
      width: 100,
      height: 100,
      x: 200,
      y: 200,
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

  return schema
}
