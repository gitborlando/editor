import { observable } from 'mobx'
import { v4 as uuidv4 } from 'uuid'
import { SchemaService } from './schema'
import {
  IEllipse,
  IFillColor,
  IFillImg,
  IFillLinearGradient,
  IFrame,
  ILine,
  INodeBase,
  INodeMeta,
  IPage,
  IPoint,
  IPolygon,
  IRect,
  ISchema,
  IText,
} from './type'

export class DefaultSchema {
  typeIndexMap: Record<string, [string, number]> = {}
  constructor(private _schema: SchemaService) {}
  meta(): ISchema['meta'] {
    return {
      id: uuidv4(),
      name: '无标题',
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
  frame(frame?: Partial<IFrame>): IFrame {
    return observable({
      type: 'frame',
      childIds: [],
      ...this.createNodeName('frame'),
      ...this.createSchemaBase(),
      ...frame,
    })
  }
  rect(rect?: Partial<IRect>): IRect {
    return observable({
      type: 'rect',
      ...this.createNodeName('rect'),
      ...this.createSchemaBase(),
      ...rect,
    })
  }
  ellipse(ellipse?: Partial<IEllipse>): IEllipse {
    return observable({
      type: 'ellipse',
      radius: 100,
      angle: 0,
      ...this.createNodeName('ellipse'),
      ...this.createSchemaBase(),
      ...ellipse,
    })
  }
  polygon(polygon?: Partial<IPolygon>): IPolygon {
    return observable({
      type: 'polygon',
      sides: 3,
      ...this.createNodeName('polygon'),
      ...this.createSchemaBase(),
      ...polygon,
    })
  }
  text(text?: Partial<IText>): IText {
    return observable({
      type: 'text',
      font: [],
      ...this.createNodeName('text'),
      ...this.createSchemaBase(),
      ...text,
    })
  }
  line(line?: Partial<ILine>): ILine {
    return observable({
      type: 'line',
      ...this.createNodeName('line'),
      ...this.createSchemaBase(),
      ...line,
    })
  }
  fillColor(type: 'color'): IFillColor {
    return { type, color: 'gray' }
  }
  fillLinearGradient(startPoint: IPoint, endPoint: IPoint): IFillLinearGradient {
    return { type: 'linearGradient', startPoint, endPoint, stops: { '0': 'red', '1': 'blue' } }
  }
  fillImg(type: 'img'): IFillImg {
    return { type, url: '' }
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
  private createSchemaBase(): INodeBase {
    return {
      ...this.createSchemaMeta(),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      opacity: 1,
      rotation: 0,
      points: [],
      fills: [{ type: 'color', color: '#D9D9D9' }],
      strokes: [],
      blurs: [],
      shadows: [],
      stroke: 'black',
      strokeWidth: 1,
    }
  }
  private createNodeName(
    type: 'page' | 'frame' | 'rect' | 'group' | 'ellipse' | 'polygon' | 'text' | 'line' | 'img'
  ) {
    this.typeIndexMap = Object.keys(this.typeIndexMap).length
      ? this.typeIndexMap
      : {
          page: ['页面', 1],
          frame: ['画板', 1],
          rect: ['矩形', 1],
          group: ['分组', 1],
          ellipse: ['椭圆', 1],
          polygon: ['多边形', 1],
          text: ['文本', 1],
          line: ['线段', 1],
          img: ['图片', 1],
        }
    let nameIndex = this.typeIndexMap[type]!
    return { name: nameIndex[0] + ' ' + (nameIndex[1] as number)++ }
  }
}
