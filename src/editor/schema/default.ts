import { observable } from 'mobx'
import { v4 as uuidv4 } from 'uuid'
import { IXY } from '../utils'
import { SchemaService } from './schema'
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

export class SchemaDefault {
  typeIndexMap: Record<string, [string, number]> = {}
  constructor(private _schema: SchemaService) {}
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
      ...this.createNodeName('page'),
    }
  }
  point(option?: Partial<IPoint>): IPoint {
    return observable({
      type: 'point',
      mode: 'no-bezier',
      x: 0,
      y: 0,
      handleIn: { x: 0, y: 0 },
      handleOut: { x: 0, y: 0 },
      radius: 0,
      ...option,
    })
  }
  frame(option?: Partial<IFrame>): IFrame {
    const name = this.createNodeName('frame')
    const nodeBase = this.createNodeBase()
    return observable({
      type: 'frame',
      childIds: [],
      ...name,
      ...nodeBase,
      ...option,
    })
  }
  group(option?: Partial<IGroup>): IGroup {
    const name = this.createNodeName('group')
    const nodeBase = this.createNodeBase()
    return observable({
      type: 'group',
      childIds: [],
      ...name,
      ...nodeBase,
      ...option,
    })
  }
  rect(option?: Partial<IRect>): IRect {
    const name = this.createNodeName('rect')
    const nodeBase = this.createNodeBase()
    const vectorBase = this.createVectorBase()
    return observable({
      vectorType: 'rect',
      radius: 0,
      ...name,
      ...nodeBase,
      ...vectorBase,
      ...option,
    })
  }
  ellipse(option?: Partial<IEllipse>): IEllipse {
    const name = this.createNodeName('ellipse')
    const nodeBase = this.createNodeBase()
    const vectorBase = this.createVectorBase()
    return observable({
      vectorType: 'ellipse',
      innerRate: 0,
      startAngle: 0,
      endAngle: 360,
      ...name,
      ...nodeBase,
      ...vectorBase,
      ...option,
    })
  }
  triangle(option?: Partial<ITriangle>): ITriangle {
    const name = this.createNodeName('triangle')
    const nodeBase = this.createNodeBase()
    const vectorBase = this.createVectorBase()
    return observable({
      vectorType: 'triangle',
      sides: 3,
      radius: 0,
      ...name,
      ...nodeBase,
      ...vectorBase,
      ...option,
    })
  }
  star(option?: Partial<IStar>): IStar {
    const name = this.createNodeName('star')
    const nodeBase = this.createNodeBase()
    const vectorBase = this.createVectorBase()
    return observable({
      vectorType: 'star',
      sides: 3,
      innerRate: 0.3,
      ...name,
      ...nodeBase,
      ...vectorBase,
      ...option,
    })
  }
  line(option?: Partial<ILine>): ILine {
    const name = this.createNodeName('line')
    const nodeBase = this.createNodeBase()
    const vectorBase = this.createVectorBase()
    return observable({
      vectorType: 'line',
      start: { x: 0, y: 0 },
      end: { x: 100, y: 0 },
      length: 100,
      ...name,
      ...nodeBase,
      ...vectorBase,
      ...option,
    })
  }
  image(option?: Partial<IRect>): IRect {
    const rect = this.rect(option)
    rect.fills.push(this.fillImage(''))
    return rect
  }
  text(option?: Partial<IText>): IText {
    const name = this.createNodeName('text')
    const nodeBase = this.createNodeBase()
    return observable({
      type: 'text',
      font: [],
      ...name,
      ...nodeBase,
      ...option,
    })
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
  private createSchemaMeta(): INodeMeta {
    return {
      id: uuidv4(),
      name: '',
      lock: false,
      visible: true,
      select: false,
      hover: false,
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
      fills: [],
      strokes: [],
      blurs: [],
      shadows: [],
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
}
