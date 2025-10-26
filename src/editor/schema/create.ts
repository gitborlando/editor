import { IXY } from '@gitborlando/geo'
import { miniId } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { createLine, createRegularPolygon, createStarPolygon } from 'src/editor/math/point'
import { themeColor } from 'src/global/color'
import { rgb } from 'src/utils/color'
import { defuOverrideArray } from 'src/utils/defu'

@autobind
class SchemaCreateService {
  meta(): V1.Meta {
    return {
      type: 'meta',
      id: 'meta',
      fileId: '',
      name: '无标题',
      version: 'v0',
      pageIds: [],
      userId: '',
    }
  }

  schema(): V1.Schema {
    const page = this.page()
    const meta = this.meta()
    meta.pageIds = [page.id]
    return {
      meta,
      [page.id]: page,
    }
  }

  page(): V1.Page {
    return {
      type: 'page',
      id: `page_${miniId()}`,
      childIds: [],
      ...this.createNodeName('page'),
    }
  }

  point(option?: Partial<V1.Point>): V1.Point {
    return {
      type: 'point',
      symmetric: 'angle',
      x: 0,
      y: 0,
      radius: 0,
      ...option,
    }
  }

  frame(option?: Partial<V1.Frame>): V1.Frame {
    const name = this.createNodeName('frame')
    const nodeBase = this.createNodeBase()
    return {
      type: 'frame',
      radius: 0,
      childIds: [],
      ...nodeBase,
      ...name,
      fills: [this.fillColor(COLOR.white)],
      ...option,
    }
  }

  group(option?: Partial<V1.Group>): V1.Group {
    const name = this.createNodeName('group')
    const nodeBase = this.createNodeBase()
    return {
      type: 'group',
      childIds: [],
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  rect(option?: Partial<V1.Rectangle>): V1.Rectangle {
    const name = this.createNodeName('rect')
    const nodeBase = this.createNodeBase()
    return {
      type: 'rect',
      points: [],
      radius: 0,
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  ellipse(option?: Partial<V1.Ellipse>): V1.Ellipse {
    const name = this.createNodeName('ellipse')
    const nodeBase = this.createNodeBase()
    return {
      type: 'ellipse',
      points: [],
      innerRate: 0,
      startAngle: 0,
      endAngle: 360,
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  polygon(option?: Partial<V1.Polygon>): V1.Polygon {
    const name = this.createNodeName('polygon')
    const nodeBase = this.createNodeBase()
    const { width, height } = option || nodeBase
    const points = createRegularPolygon(width!, height!, 3)
    return {
      type: 'polygon',
      sides: 3,
      radius: 0,
      points,
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  star(option?: Partial<V1.Star>): V1.Star {
    const name = this.createNodeName('star')
    const nodeBase = this.createNodeBase()
    const { width, height } = option || nodeBase
    const points = createStarPolygon(width!, height!, 5, 0.382)
    return {
      type: 'star',
      pointCount: 5,
      radius: 0,
      innerRate: 0.382,
      points,
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  line(option?: Partial<V1.Line>): V1.Line {
    const name = this.createNodeName('line')
    const nodeBase = this.createNodeBase()
    const { x, y } = option || nodeBase
    const points = createLine(XY._(x, y), 0)
    return {
      type: 'line',
      points,
      ...nodeBase,
      ...name,
      height: 0,
      fills: [],
      strokes: [this.stroke()],
      ...option,
    }
  }

  irregular(option?: Partial<V1.Path>): V1.Path {
    const name = this.createNodeName('irregular')
    const nodeBase = this.createNodeBase()
    return {
      type: 'irregular',
      points: [],
      ...nodeBase,
      ...name,
      ...option,
    }
  }

  image(option?: Partial<V1.Rectangle>): V1.Rectangle {
    const rect = this.rect(option)
    rect.fills.push(this.fillImage(''))
    return rect
  }

  text(option?: NestPartial<V1.Text>): V1.Text {
    const name = this.createNodeName('text')
    const nodeBase = this.createNodeBase()
    return t<V1.Text>(
      defuOverrideArray(
        {
          ...nodeBase,
          ...name,
          ...option,
        },
        {
          type: 'text',
          content: '文本1',
          style: {
            fontSize: 16,
            fontWeight: 500,
            align: 'center',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            letterSpacing: 0,
            lineHeight: 16,
          },
          fills: [this.fillColor(COLOR.black, 1)],
        },
      ),
    )
  }

  fillColor(color = rgb(204, 204, 204), alpha = 1): V1.FillColor {
    return { type: 'color', visible: true, color, alpha }
  }

  fillLinearGradient(start: IXY = XY._(0, 0), end: IXY = XY._(1, 1)): V1.FillLinearGradient {
    return {
      type: 'linearGradient',
      visible: true,
      start,
      end,
      stops: [
        { offset: 0, color: COLOR.blue },
        { offset: 1, color: COLOR.pinkRed },
      ],
      alpha: 1,
    }
  }

  fillImage(url: string = 'Assets.editor.rightPanel.operate.picker.defaultImage'): V1.FillImage {
    return {
      type: 'image',
      visible: true,
      url,
      matrix: [0, 0, 0, 0, 0, 0],
      alpha: 1,
    }
  }

  stroke(option?: Partial<V1.Stroke>) {
    return <V1.Stroke>{
      visible: true,
      fill: this.fillColor(COLOR.black),
      align: 'center',
      width: 1,
      cap: 'round',
      join: 'round',
      ...option,
    }
  }

  shadow(option?: Partial<V1.Shadow>): V1.Shadow {
    return <V1.Shadow>{
      visible: true,
      offsetX: 5,
      offsetY: 5,
      blur: 2,
      spread: 2,
      fill: this.fillColor(COLOR.black),
      ...option,
    }
  }

  outline(option?: Partial<V1.Outline>): V1.Outline {
    return {
      color: themeColor(),
      width: 2,
      ...option,
    }
  }

  textDecoration(option?: Partial<V1.TextDecoration>): V1.TextDecoration {
    return {
      style: 'underline',
      color: themeColor(),
      ...option,
    }
  }

  private createSchemaMeta(): V1.NodeMeta {
    return {
      id: miniId(),
      name: '',
      lock: false,
      visible: true,
      parentId: '',
    }
  }

  private createNodeBase(): V1.NodeBase {
    return {
      ...this.createSchemaMeta(),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      opacity: 1,
      rotation: 0,
      hFlip: false,
      vFlip: false,
      fills: [this.fillColor(rgb(204, 204, 204), 1)],
      strokes: [],
      blurs: [],
      shadows: [],
    }
  }

  private allNodeCount = 0

  createNodeName(type: string) {
    const map = {
      page: ['页面', 1],
      frame: ['画板', 1],
      group: ['分组', 1],
      rect: ['矩形', 1],
      ellipse: ['椭圆', 1],
      polygon: ['多边形', 1],
      star: ['星形', 1],
      irregular: ['矢量图形', 1],
      line: ['线段', 1],
      text: ['文本', 1],
      image: ['图片', 1],
    }
    const [name] = map[type as keyof typeof map]

    return { name: `${name} ${++this.allNodeCount}` }
  }
}

export const SchemaCreate = new SchemaCreateService()
