import { xy_new } from '~/editor/math/xy'
import { SchemaDefaultService } from '~/editor/schema/default'
import { IFillColor, IFillLinearGradient, INode } from '~/editor/schema/type'
import { rgba } from '~/shared/utils/color'
import { uuid } from '~/shared/utils/normal'

export function mockFill(schemaDefault: SchemaDefaultService) {
  const [width, height] = [100, 100]
  const [halfWidth, halfHeight] = [width / 2, height / 2]
  const colorFill = <IFillColor>{
    type: 'color',
    color: rgba(204, 204, 204, 1),
  }
  const LinearGradient = <IFillLinearGradient>{
    type: 'linearGradient',
    start: xy_new(-100, 100),
    end: xy_new(halfWidth * 2, -100),
    stops: [
      { offset: 0, color: rgba(255, 200, 200, 0.5) },
      { offset: 1, color: rgba(200, 200, 255, 0.5) },
    ],
  }
  const nodes = <Record<string, INode>>{
    rect2: schemaDefault.rect({
      id: 'rect2',
      name: '测试矩形1',
      width: 100,
      height: 100,
      x: 100,
      centerX: 150,
      centerY: 50,
      parentId: 'page1',
      fills: [
        schemaDefault.fillColor(rgba(255, 200, 200, 0.5)),
        schemaDefault.fillColor(rgba(200, 200, 255, 0.5)),
      ],
    }),
  }

  return {
    meta: { id: 'mock1', name: '测试文件1', user: 'myself' },
    nodes,
    pages: [
      {
        id: uuid(),
        name: '测试页面1',
        zoom: 1,
        offset: { x: 100, y: 100 },
        childIds: Object.keys(nodes),
      },
    ],
  }
}
