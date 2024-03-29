import autobind from 'class-autobind-decorator'
import { nanoid } from 'nanoid'
import { COLOR, rgba } from '~/shared/utils/color'
import { IRect, IXY } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import {
  IEllipse,
  IFillColor,
  // IFillGonicGradient,
  IFillImage,
  IFillLinearGradient,
  // IFillRadialGradient,
  IFrame,
  IGroup,
  ILine,
  INodeBase,
  INodeMeta,
  IPage,
  IPoint,
  IPolygon,
  IRectangle,
  ISchema,
  IStar,
  IStroke,
  IText,
} from './type'

@autobind
export class SchemaDefaultService {
  typeIndexMap: Record<string, [string, number]> = {}
  meta(): ISchema['meta'] {
    return {
      id: nanoid(),
      name: '无标题',
      user: 'myself',
      version: 0,
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
      id: `page:${nanoid()}`,
      childIds: [],
      zoom: 1,
      x: 0,
      y: 0,
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
    return {
      type: 'frame',
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
    return { type: 'vector', vectorType: 'rect', radius: 0, ...nodeBase, ...name, ...option }
  }
  ellipse(option?: Partial<IEllipse>): IEllipse {
    const name = this.createNodeName('ellipse')
    const nodeBase = this.createNodeBase()
    return {
      type: 'vector',
      vectorType: 'ellipse',
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
    return {
      type: 'vector',
      vectorType: 'polygon',
      sides: 3,
      radius: 0,
      ...nodeBase,
      ...name,
      ...option,
    }
  }
  star(option?: Partial<IStar>): IStar {
    const name = this.createNodeName('star')
    const nodeBase = this.createNodeBase()
    return {
      type: 'vector',
      vectorType: 'star',
      points: 5,
      radius: 0,
      innerRate: 0.382,
      ...nodeBase,
      ...name,
      ...option,
    }
  }
  line(option?: Partial<ILine>): ILine {
    const name = this.createNodeName('line')
    const nodeBase = this.createNodeBase()
    return {
      type: 'vector',
      vectorType: 'line',
      start: { x: 0, y: 100 },
      end: { x: 100, y: 100 },
      length: 100,
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
  fillColor(color = rgba(204, 204, 204, 1)): IFillColor {
    return { type: 'color', visible: true, color }
  }
  fillLinearGradient(start: IXY, end: IXY): IFillLinearGradient {
    return {
      type: 'linearGradient',
      visible: true,
      start,
      end,
      stops: [
        { offset: 0, color: COLOR.blue },
        { offset: 1, color: COLOR.pinkRed },
      ],
    }
  }
  // fillRadialGradient(center: IXY, radiusA: IXY, radiusB: IXY): IFillRadialGradient {
  //   return {
  //     type: 'radialGradient',
  //     center,
  //     radiusA,
  //     radiusB,
  //     stops: [
  //       { xy: center, color: 'skyBlue' },
  //       { xy: radiusA, color: 'pink' },
  //     ],
  //   }
  // }
  // fillGonicGradient(startAngle: number, center: IXY): IFillGonicGradient {
  //   return { type: 'gonicGradient', startAngle, center, stops: [{ xy: center, color: 'skyBlue' }] }
  // }
  fillImage(url: string = Asset.editor.rightPanel.operate.picker.defaultImage): IFillImage {
    return { type: 'image', visible: true, url, matrix: [0, 0, 0, 0, 0, 0] }
  }
  stroke(option?: Partial<IStroke>) {
    return <IStroke>{
      visible: true,
      fill: this.fillColor(rgba(0, 0, 0, 1)),
      position: 'center',
      width: 1,
      vertex: '',
      ...option,
    }
  }
  geometryDetail({ x, y, width, height }: IRect) {
    return {
      x: x,
      y: y,
      centerX: x + width / 2,
      centerY: y + height / 2,
      width: width,
      height: height,
      rotation: 0,
    }
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
    const colorFill = <IFillColor>{
      type: 'color',
      visible: true,
      color: rgba(204, 204, 204, 1),
    }
    return {
      ...this.createSchemaMeta(),
      x: 0,
      y: 0,
      centerX: 50,
      centerY: 50,
      width: 100,
      height: 100,
      opacity: 1,
      rotation: 0,
      hFlip: false,
      vFlip: false,
      fills: [colorFill],
      strokes: [],
      blurs: [],
      shadows: [],
    }
  }
  private createNodeName(
    type:
      | 'page'
      | 'frame'
      | 'rect'
      | 'group'
      | 'ellipse'
      | 'polygon'
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
          polygon: ['多边形', 1],
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

export const SchemaDefault = new SchemaDefaultService()
