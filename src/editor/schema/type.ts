import { TextStyleAlign, TextStyleFontStyle, TextStyleFontWeight } from 'pixi.js'
import { IXY } from '~/shared/utils/normal'
import { IOperateDiff } from './diff'

export type ID = string

export type ISchema = {
  meta: IMeta
  [id: string]: IPage | INode | IMeta
}

export type ISchemaItem = INode | IPage | IMeta

export type INodeOrPage = INode | IPage

export type IMeta = {
  type: 'meta'
  id: 'meta'
  fileId: string
  name: string
  version: number
  pageIds: string[]
  clients: Record<ID, IClient>
}

export type IClient = {
  id: ID
  selectIds: ID[]
  selectPageId: ID
  mouse: IXY
}

export type INodeParentBase = {
  childIds: string[]
}

export type IPage = INodeParentBase & {
  type: 'page'
  id: `page_${string}`
  name: string
  zoom: number
  x: number
  y: number
}

export type INodeParent = IFrame | IGroup | IPage

export type INode =
  | IFrame
  | IGroup
  | IRectangle
  | IEllipse
  | IText
  | ILine
  | IPolygon
  | IStar
  | IIrregular

export type INodeMeta = {
  id: string
  name: string
  lock: boolean
  visible: boolean
  parentId: string
}

export type IGeometryDetail = {
  x: number
  y: number
  centerX: number
  centerY: number
  width: number
  height: number
  rotation: number
}

export type INodeBase = INodeMeta &
  IGeometryDetail & {
    opacity: number
    hFlip: boolean
    vFlip: boolean
    fills: IFill[]
    strokes: IStroke[]
    blurs: any[]
    shadows: IShadow[]
  }

export type IFrame = INodeBase &
  INodeParentBase & {
    type: 'frame'
    radius: number
  }

export type IGroup = INodeBase &
  INodeParentBase & {
    type: 'group'
  }

export type IBezierType = 'no-bezier' | 'symmetric' | 'angle-symmetric' | 'no-symmetric'

export type IPoint = {
  type: 'point'
  bezierType: IBezierType
  x: number
  y: number
  radius: number
  handleLeft?: IXY
  handleRight?: IXY
  jumpToRight?: boolean
}

export type IVector = IRectangle | IEllipse | IPolygon | IStar | ILine | IIrregular

export type IVectorType = { type: 'vector' }

export type IIrregular = INodeBase &
  IVectorType & {
    vectorType: 'irregular'
    closed: boolean
    points: IPoint[]
  }

export type IRectangle = INodeBase &
  IVectorType & {
    vectorType: 'rect'
    radius: number
  }

export type IEllipse = INodeBase &
  IVectorType & {
    vectorType: 'ellipse'
    innerRate: number
    startAngle: number
    endAngle: number
  }

export type IPolygon = INodeBase &
  IVectorType & {
    vectorType: 'polygon'
    sides: number
    radius: number
  }

export type IStar = INodeBase &
  IVectorType & {
    vectorType: 'star'
    points: number
    radius: number
    innerRate: number
  }

export type ILine = INodeBase &
  IVectorType & {
    vectorType: 'line'
  }

export type ISvg = INodeBase & {
  type: 'svg'
  svg: string
}

export type IText = INodeBase & {
  type: 'text'
  content: string
  style: {
    align: TextStyleAlign
    breakWords: boolean
    // dropShadow: boolean
    // dropShadowAlpha: number
    // dropShadowAngle: number
    // dropShadowBlur: number
    // dropShadowColor: string | number
    // dropShadowDistance: number
    fontFamily: string | string[]
    fontSize: number
    fontStyle: TextStyleFontStyle
    fontWeight: TextStyleFontWeight
    letterSpacing: number
    lineHeight: number
    // lineJoin: TextStyleLineJoin
    // miterLimit: number
    // padding: number
    // textBaseline: TextStyleTextBaseline
    // whiteSpace: TextStyleWhiteSpace
    wordWrap: boolean
    // wordWrapWidth: number
    // leading: number
  }
}

export type IFill = IFillColor | IFillLinearGradient | IFillImage

type IFillMeta = {
  visible: boolean
  alpha: number
}

export type IFillColor = IFillMeta & {
  type: 'color'
  color: string
}

export type IFillLinearGradient = IFillMeta & {
  type: 'linearGradient'
  start: IXY
  end: IXY
  stops: { offset: number; color: string }[]
}

export type IFillImage = IFillMeta & {
  type: 'image'
  url: string
  matrix: number[]
}

// export type IFillRadialGradient = {
//   type: 'radialGradient'
//   center: IXY
//   radiusA: IXY
//   radiusB: IXY
//   stops: { xy: IXY; color: string }[]
// }

// export type IFillGonicGradient = {
//   type: 'gonicGradient'
//   startAngle: number
//   center: IXY
//   stops: { xy: IXY; color: string }[]
// }

export type IStroke = {
  visible: boolean
  fill: IFill
  align: 'inner' | 'center' | 'outer'
  width: number
  vertex: ''
  cap: number
  join: number
}

export type IShadow = {
  visible: boolean
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  fill: IFill
}

export type ISchemaPropKey =
  | keyof IMeta
  | keyof IClient
  | keyof IPage
  | keyof INodeMeta
  | keyof IFrame
  | keyof IGroup
  | keyof IRectangle
  | keyof IPolygon
  | keyof IStar
  | keyof IIrregular
  | keyof IEllipse
  | keyof ILine
  | keyof IFillColor
  | keyof IFillLinearGradient
  | keyof IFillImage
  | keyof IShadow
  | keyof IStroke
  | keyof IText
  | keyof IText['style']
  | keyof IPoint
  | keyof INodeBase

export type ISchemaChangeType =
  | 'addClient'
  | 'selectPage'
  | 'syncMouse'
  | 'selectIds'
  | 'clientsChange'
  | 'changePagesCount'
  | 'changeNodesCount'
  | 'changeNodeHierarchy'
  | 'changeNodeAlign'
  | 'changeNodeGeometry'
  | 'changeTextContent'
  | 'changeTextStyle'

export const SchemaChangeType = <ISchemaChangeType[]>[
  'addClient',
  'selectPage',
  'syncMouse',
  'selectIds',
  'clientsChange',
  'changePagesCount',
  'changeNodesCount',
  'changeNodeHierarchy',
  'changeNodeAlign',
  'changeNodeGeometry',
  'changeTextContent',
  'changeTextStyle',
]

export type ISchemaOperation = {
  id: ID
  timestamp: number
  changeType: ISchemaChangeType
  changeIds: ID[]
  diff: IOperateDiff
  description?: string
}

export type ISchemaListener = {
  listenType: ISchemaChangeType
  callback: (operation: ISchemaOperation) => void
}

export type ISchemaHistory = {
  operations: ISchemaOperation[]
  description: string
}
