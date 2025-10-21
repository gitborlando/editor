import { createCache } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { customAlphabet, nanoid } from 'nanoid'
import { createLine, createRegularPolygon, createStarPolygon } from 'src/editor/math/point'
import { COLOR } from 'src/shared/utils/color'
import { IRect, IXY } from 'src/shared/utils/normal'
import { rgb } from 'src/utils/color'
import { xy_ } from '../math/xy'
import {
  IClient,
  IEllipse,
  IFillColor,
  // IFillGonicGradient,
  IFillImage,
  IFillLinearGradient,
  // IFillRadialGradient,
  IFrame,
  IGroup,
  IIrregular,
  ILine,
  IMeta,
  INode,
  INodeBase,
  INodeMeta,
  INodeParent,
  IPage,
  IPoint,
  IPolygon,
  IRectangle,
  ISchema,
  IShadow,
  IStar,
  IStroke,
  IText,
} from './type'

type NestPartial<T> = {
  [K in keyof T]?: NestPartial<T[K]>
}

@autobind
class SchemaDefaultService {
  devFileId?: string
  typeIndexMapCache = createCache<string, Record<string, [string, number]>>()
  allNodeCount = 0
  meta(): IMeta {
    return {
      type: 'meta',
      id: 'meta',
      fileId: nanoid(),
      name: '无标题',
      version: 0,
      pageIds: [],
    }
  }
  client(): IClient {
    return {
      id: 'client',
      type: 'client',
      selectIds: [],
      selectPageId: '',
    }
  }
  schema(): ISchema {
    const page = this.page()
    const meta = this.meta()
    const client = this.client()
    meta.pageIds = [page.id]
    client.selectPageId = page.id
    return {
      meta,
      client,
      [page.id]: page,
    }
  }
  page(): IPage {
    return {
      type: 'page',
      id: `page_${nanoid()}`,
      childIds: [],
      ...this.createNodeName('page'),
    }
  }
  point(option?: Partial<IPoint>): IPoint {
    return {
      type: 'point',
      symmetric: 'angle',
      x: 0,
      y: 0,
      radius: 0,
      ...option,
    }
  }
  frame(option?: Partial<IFrame>): IFrame {
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
  group(option?: Partial<IGroup>): IGroup {
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
  rect(option?: Partial<IRectangle>): IRectangle {
    const name = this.createNodeName('rect')
    const nodeBase = this.createNodeBase()
    return { type: 'rect', points: [], radius: 0, ...nodeBase, ...name, ...option }
  }
  ellipse(option?: Partial<IEllipse>): IEllipse {
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
  polygon(option?: Partial<IPolygon>): IPolygon {
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
  star(option?: Partial<IStar>): IStar {
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
  line(option?: Partial<ILine>): ILine {
    const name = this.createNodeName('line')
    const nodeBase = this.createNodeBase()
    const { x, y } = option || nodeBase
    const points = createLine(xy_(x, y), 0)
    return {
      type: 'line',
      points,
      ...nodeBase,
      ...name,
      ...option,
      height: 0,
      fills: [],
      strokes: [this.stroke()],
    }
  }
  irregular(option?: Partial<IIrregular>): IIrregular {
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
  image(option?: Partial<IRect>): IRect {
    const rect = this.rect(option)
    rect.fills.push(this.fillImage(''))
    return rect
  }
  text(option?: NestPartial<IText>): IText {
    const name = this.createNodeName('text')
    const nodeBase = this.createNodeBase()
    const style = (option?.style || {}) as Partial<IText['style']>
    return {
      type: 'text',
      content: '文本1',
      ...nodeBase,
      ...name,
      ...(option as Partial<IText>),
      style: {
        fontSize: 16,
        fontWeight: 500,
        align: 'center',
        fontFamily: 'Arial',
        fontStyle: 'normal',
        letterSpacing: 0,
        lineHeight: 16,
        ...style,
      },
      fills: [this.fillColor(rgb(0, 0, 0), 1)],
    }
  }
  fillColor(color = rgb(204, 204, 204), alpha = 1): IFillColor {
    return { type: 'color', visible: true, color, alpha }
  }
  fillLinearGradient(start: IXY = xy_(0, 0), end: IXY = xy_(1, 1)): IFillLinearGradient {
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
  fillImage(url: string = 'Assets.editor.rightPanel.operate.picker.defaultImage'): IFillImage {
    return {
      type: 'image',
      visible: true,
      url,
      matrix: [0, 0, 0, 0, 0, 0],
      alpha: 1,
    }
  }
  stroke(option?: Partial<IStroke>) {
    return <IStroke>{
      visible: true,
      fill: this.fillColor(rgb(0, 0, 0)),
      align: 'center',
      width: 1,
      cap: 'round',
      join: 'round',
      ...option,
    }
  }
  shadow(option?: Partial<IShadow>) {
    return <IShadow>{
      visible: true,
      offsetX: 5,
      offsetY: 5,
      blur: 2,
      spread: 2,
      fill: this.fillColor(rgb(0, 0, 0)),
      ...option,
    }
  }
  connect(parent: INodeParent, child: INode) {
    parent.childIds.push(child.id)
    child.parentId = parent.id
  }
  private createSchemaMeta(): INodeMeta {
    return {
      id: nanoid(),
      name: '',
      lock: false,
      visible: true,
      parentId: '',
    }
  }
  private createNodeBase(): INodeBase {
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

  private customNanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

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

export const SchemaDefault = new SchemaDefaultService()
