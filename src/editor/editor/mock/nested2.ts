import { xy_ } from 'src/editor/math/xy'
import { SchemaDefault } from 'src/editor/schema/default'
import { IFillLinearGradient, ISchema } from 'src/editor/schema/type'
import { COLOR } from 'src/shared/utils/color'

export function mockNested2() {
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
  const imageFill = SchemaDefault.fillImage(
    'https://images.pexels.com/photos/24778776/pexels-photo-24778776.jpeg?auto=compress&cs=tinysrgb&h=130'
  )
  const schema: ISchema = {
    meta: {
      type: 'meta',
      id: 'meta',
      fileId: 'test-file-1',
      name: '测试文件1',
      version: 0,
      pageIds: ['page_1'],
    },
    client: {
      id: 'client',
      type: 'client',
      selectIds: [],
      selectPageId: 'page_1',
      viewport: { page_1: { zoom: 1, xy: { x: 100, y: 100 } } },
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
      childIds: ['text2', 'triangle1', 'line1', 'rect3'],
    }),
    text2: SchemaDefault.text({
      id: 'text2',
      name: '测试文本1',
      width: 100,
      height: 100,
      x: 20,
      y: 100,
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
      x: 100,
      y: 350,
      strokes: [SchemaDefault.stroke()],
      parentId: 'frame:1',
    }),
  }

  return schema
}
