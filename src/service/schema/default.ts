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
  IText,
} from './type'

export class DefaultSchema {
  constructor(public schema: SchemaService) {}
  page(): IPage {
    return {
      id: uuidv4(),
      name: 'page',
      childIds: [],
    }
  }
  frame(frame?: Partial<IFrame>): IFrame {
    return observable({
      type: 'frame',
      childIds: [],
      ...this.createSchemaBase(),
      ...frame,
    })
  }
  rect(rect?: Partial<IRect>): IRect {
    return observable({
      type: 'rect',
      ...this.createSchemaBase(),
      ...rect,
    })
  }
  ellipse(ellipse?: Partial<IEllipse>): IEllipse {
    return observable({
      type: 'ellipse',
      radius: 100,
      angle: 0,
      ...this.createSchemaBase(),
      ...ellipse,
    })
  }
  polygon(polygon?: Partial<IPolygon>): IPolygon {
    return observable({
      type: 'polygon',
      sides: 3,
      ...this.createSchemaBase(),
      ...polygon,
    })
  }
  text(text?: Partial<IText>): IText {
    return observable({
      type: 'text',
      font: [],
      ...this.createSchemaBase(),
      ...text,
    })
  }
  line(line?: Partial<ILine>): ILine {
    return observable({
      type: 'line',
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
}
