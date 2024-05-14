import autobind from 'class-autobind-decorator'
import { nanoid } from 'nanoid'
import { createCache } from '~/shared/cache'
import { COLOR, rgb } from '~/shared/utils/color'
import { IRect, IXY } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { xy_ } from '../math/xy'
import { Schema } from './schema'
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
  INodeBase,
  INodeMeta,
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

@autobind
class SchemaDefaultService {
  devFileId?: string
  typeIndexMapCache = createCache<string, Record<string, [string, number]>>()
  meta(): IMeta {
    return {
      type: 'meta',
      id: 'meta',
      fileId: nanoid(),
      name: '无标题',
      version: 0,
      pageIds: [],
      clients: {},
    }
  }
  client(option?: Partial<IClient>): IClient {
    return {
      id: nanoid(),
      selectIds: [],
      selectPageId: '',
      mouse: xy_(0, 0),
      ...option,
    }
  }
  schema(): ISchema {
    const page = this.page()
    const meta = this.meta()
    meta.pageIds = [page.id]
    return {
      meta: meta,
      [page.id]: page,
    }
  }
  page(): IPage {
    return {
      type: 'page',
      id: `page_${nanoid()}`,
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
      ...nodeBase,
      ...name,
      ...option,
      fills: [],
      strokes: [this.stroke()],
      height: 0,
    }
  }
  irregular(option?: Partial<IIrregular>): IIrregular {
    const name = this.createNodeName('irregular')
    const nodeBase = this.createNodeBase()
    return {
      type: 'vector',
      vectorType: 'irregular',
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
  text(option?: Partial<IText>): IText {
    const name = this.createNodeName('text')
    const nodeBase = this.createNodeBase()
    return {
      type: 'text',
      content: '文本1',
      style: {
        fontSize: 16,
        fontWeight: '500',
        align: 'center',
        breakWords: true,
        fontFamily: '',
        fontStyle: 'normal',
        letterSpacing: 0,
        lineHeight: 16,
        wordWrap: true,
      },
      ...nodeBase,
      ...name,
      ...option,
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
  fillImage(url: string = Asset.editor.rightPanel.operate.picker.defaultImage): IFillImage {
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
  createNodeName(type: string) {
    const typeIndexMap = this.typeIndexMapCache.getSet(
      Schema.client?.selectPageId || 'abc',
      () => ({
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
      })
    )
    let nameIndex = typeIndexMap[type]!
    return { name: nameIndex[0] + ' ' + (nameIndex[1] as number)++ }
  }
}

export const SchemaDefault = new SchemaDefaultService()
