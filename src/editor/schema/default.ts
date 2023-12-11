import { inject, injectable } from 'tsyringe'
import { v4 as uuidv4 } from 'uuid'
import { autobind } from '~/shared/decorator'
import { IBound, IXY } from '~/shared/utils'
import {
  IEllipse,
  IFillColor,
  IFillGonicGradient,
  IFillImage,
  IFillLinearGradient,
  IFillRadialGradient,
  IFrame,
  IGroup,
  ILine,
  INode,
  INodeBase,
  INodeMeta,
  IPage,
  IPoint,
  IRect,
  ISchema,
  IStar,
  IText,
  ITriangle,
  IVector,
} from './type'

@autobind
@injectable()
export class SchemaDefaultService {
  typeIndexMap: Record<string, [string, number]> = {}
  meta(): ISchema['meta'] {
    return {
      id: uuidv4(),
      name: '无标题',
      user: 'myself',
    }
  }
  schema(): ISchema {
    return {
      meta: this.meta(),
      nodes: {},
      pages: [this.page()],
    }
  }
  page(): IPage {
    return {
      id: uuidv4(),
      childIds: [],
      zoom: 1,
      offset: { x: 0, y: 0 },
      ...this.createNodeName('page'),
    }
  }
  point(option?: Partial<IPoint>): IPoint {
    return {
      type: 'point',
      bezierType: 'no-bezier',
      x: 0,
      y: 0,
      handleLeft: { x: 0, y: 0 },
      handleRight: { x: 0, y: 0 },
      radius: 0,
      ...option,
    }
  }
  frame(option?: Partial<IFrame>): IFrame {
    const name = this.createNodeName('frame')
    const nodeBase = this.createNodeBase()
    const fill = { fill: 'white' }
    return {
      type: 'frame',
      childIds: [],
      ...nodeBase,
      ...name,
      ...fill,
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
  rect(option?: Partial<IRect>): IRect {
    const name = this.createNodeName('rect')
    const vectorBase = this.createVectorBase()
    const points = this.createRectPoints(
      option?.x ?? 0,
      option?.y ?? 0,
      option?.width ?? 100,
      option?.height ?? 100
    )
    return {
      vectorType: 'rect',
      radius: 0,
      ...vectorBase,
      ...points,
      ...name,
      ...option,
    }
  }
  ellipse(option?: Partial<IEllipse>): IEllipse {
    const name = this.createNodeName('ellipse')
    const vectorBase = this.createVectorBase()
    return {
      vectorType: 'ellipse',
      innerRate: 0,
      startAngle: 0,
      endAngle: 360,
      ...vectorBase,
      ...name,
      ...option,
    }
  }
  triangle(option?: Partial<ITriangle>): ITriangle {
    const name = this.createNodeName('triangle')
    const vectorBase = this.createVectorBase()
    const points = this.createTrianglePoints(
      option?.x ?? 0,
      option?.y ?? 0,
      option?.width ?? 100,
      option?.height ?? 100
    )
    return {
      vectorType: 'triangle',
      sides: 3,
      radius: 0,
      ...vectorBase,
      ...name,
      ...points,
      ...option,
    }
  }
  star(option?: Partial<IStar>): IStar {
    const name = this.createNodeName('star')
    const vectorBase = this.createVectorBase()
    return {
      vectorType: 'star',
      sides: 3,
      radius: 0,
      innerRate: 0.3,
      ...vectorBase,
      ...name,
      ...option,
    }
  }
  line(option?: Partial<ILine>): ILine {
    const name = this.createNodeName('line')
    const vectorBase = this.createVectorBase()
    const points = this.createLinePoints(
      option?.start || { x: 0, y: 100 },
      option?.end || { x: 100, y: 100 }
    )
    return {
      vectorType: 'line',
      start: { x: 0, y: 100 },
      end: { x: 100, y: 100 },
      length: 100,
      ...vectorBase,
      ...name,
      ...points,
      ...option,
    }
  }
  image(option?: Partial<IRect>): IRect {
    const rect = this.rect(option)
    rect.fills.push(this.fillImage(''))
    return rect
  }
  text(option?: Partial<IText>): IText {
    const name = this.createNodeName('text')
    const nodeBase = this.createNodeBase()
    return {
      type: 'text',
      font: [],
      ...nodeBase,
      ...name,
      ...option,
    }
  }
  fillColor(): IFillColor {
    return { type: 'color', color: 'skyBlue' }
  }
  fillLinearGradient(start: IXY, end: IXY): IFillLinearGradient {
    return {
      type: 'linearGradient',
      start,
      end,
      stops: [
        { xy: start, color: 'skyBlue' },
        { xy: end, color: 'pink' },
      ],
    }
  }
  fillRadialGradient(center: IXY, radiusA: IXY, radiusB: IXY): IFillRadialGradient {
    return {
      type: 'radialGradient',
      center,
      radiusA,
      radiusB,
      stops: [
        { xy: center, color: 'skyBlue' },
        { xy: radiusA, color: 'pink' },
      ],
    }
  }
  fillGonicGradient(startAngle: number, center: IXY): IFillGonicGradient {
    return { type: 'gonicGradient', startAngle, center, stops: [{ xy: center, color: 'skyBlue' }] }
  }
  fillImage(url: string): IFillImage {
    return { type: 'image', url, matrix: [0, 0, 0, 0, 0, 0] }
  }
  initNodeXYBound(node: INode, { x, y, width, height }: IBound) {
    node.x = x
    node.y = y
    node.pivotX = x
    node.pivotY = y
    node.centerX = x + width / 2
    node.centerY = y + height / 2
    node.width = width
    node.height = height
  }
  private createSchemaMeta(): INodeMeta {
    return {
      id: uuidv4(),
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
      pivotX: 0,
      pivotY: 0,
      centerX: 50,
      centerY: 50,
      width: 100,
      height: 100,
      opacity: 1,
      rotation: 0,
      hFlip: false,
      vFlip: false,
      fills: [],
      strokes: [],
      blurs: [],
      shadows: [],
      fill: '#CCCCCC',
    }
  }
  private createVectorBase(option?: Partial<IVector>): IVector {
    return {
      type: 'vector',
      closed: true,
      points: [],
      ...this.createNodeBase(),
      ...option,
    }
  }
  private createNodeName(
    type:
      | 'page'
      | 'frame'
      | 'rect'
      | 'group'
      | 'ellipse'
      | 'triangle'
      | 'star'
      | 'irregular'
      | 'text'
      | 'line'
      | 'image'
  ) {
    this.typeIndexMap = Object.keys(this.typeIndexMap).length
      ? this.typeIndexMap
      : {
          page: ['页面', 1],
          frame: ['画板', 1],
          group: ['分组', 1],
          rect: ['矩形', 1],
          ellipse: ['椭圆', 1],
          triangle: ['三角形', 1],
          star: ['星形', 1],
          irregular: ['矢量图形', 1],
          line: ['线段', 1],
          text: ['文本', 1],
          image: ['图片', 1],
        }
    let nameIndex = this.typeIndexMap[type]!
    return { name: nameIndex[0] + ' ' + (nameIndex[1] as number)++ }
  }
  private createRectPoints(x: number, y: number, width: number, height: number) {
    return {
      points: [
        this.createPoint(-width / 2, -height / 2, 'no-bezier', 0),
        this.createPoint(width / 2, -height / 2, 'no-bezier', 0),
        this.createPoint(width / 2, height / 2, 'no-bezier', 0),
        this.createPoint(-width / 2, height / 2, 'no-bezier', 0),
      ],
    }
  }
  private createTrianglePoints(x: number, y: number, width: number, height: number) {
    return {
      points: [
        this.createPoint(width / 2, -height / 2, 'no-bezier', 0),
        this.createPoint(width / 2, height / 2, 'no-bezier', 0),
        this.createPoint(-width / 2, height / 2, 'no-bezier', 0),
      ],
    }
  }
  private createLinePoints(start: IXY, end: IXY) {
    return {
      points: [
        this.createPoint(start.x, start.y, 'no-bezier', 0),
        this.createPoint(end.x, end.y, 'no-bezier', 0, undefined, undefined, true),
      ],
    }
  }
  public createPoint(
    x: number,
    y: number,
    bezierType: IPoint['bezierType'],
    radius: number = 0,
    handleLeft?: IPoint['handleLeft'],
    handleRight?: IPoint['handleRight'],
    jumpToRight?: IPoint['jumpToRight']
  ) {
    return {
      type: 'point',
      x,
      y,
      bezierType,
      radius,
      handleLeft,
      handleRight,
      jumpToRight,
    } as IPoint
  }
}

export const injectSchemaDefault = inject(SchemaDefaultService)
