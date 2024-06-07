import { LINE_CAP, LINE_JOIN } from 'pixi.js'
import { ImmuiPatch } from 'src/shared/immui/immui'
import { AllKeys, IXY } from 'src/shared/utils/normal'

export type ID = string

export type ISchema = {
  meta: IMeta
  client: IClient
  [id: string & {}]: IPage | INode | IMeta | IClient
}

export type ISchemaItem = INode | IPage | IMeta | IClient

export type INodeOrPage = INode | IPage

export type IMeta = {
  type: 'meta'
  id: 'meta'
  fileId: string
  name: string
  version: number
  pageIds: string[]
}

export type IClient = {
  id: 'client'
  type: 'client'
  selectIds: ID[]
  selectPageId: ID
  viewport: Record<ID, { xy: IXY; zoom: number }>
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
  width: number
  height: number
  rotation: number
}

export type INodeBase = INodeMeta &
  IGeometryDetail & {
    width: number
    height: number
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

export type IPoint = {
  type: 'point'
  symmetric: 'angle' | 'complete' | 'none'
  x: number
  y: number
  radius: number
  handleLeft?: IXY
  handleRight?: IXY
  endPath?: boolean
  startPath?: boolean
}

export type IVector = IRectangle | IEllipse | IPolygon | IStar | ILine | IIrregular

export type IVectorBase = {
  points: IPoint[]
}

export type IIrregular = INodeBase &
  IVectorBase & {
    type: 'irregular'
  }

export type IRectangle = INodeBase &
  IVectorBase & {
    type: 'rect'
    radius: number
  }

export type IEllipse = INodeBase &
  IVectorBase & {
    type: 'ellipse'
    innerRate: number
    startAngle: number
    endAngle: number
  }

export type IPolygon = INodeBase &
  IVectorBase & {
    type: 'polygon'
    sides: number
    radius: number
  }

export type IStar = INodeBase &
  IVectorBase & {
    type: 'star'
    pointCount: number
    radius: number
    innerRate: number
  }

export type ILine = INodeBase &
  IVectorBase & {
    type: 'line'
    length: number
  }

export type IText = INodeBase & {
  type: 'text'
  content: string
  style: {
    align: 'left' | 'center' | 'right'
    fontFamily: string | string[]
    fontSize: number
    fontStyle: 'normal' | 'italic' | 'oblique'
    fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | number
    letterSpacing: number
    lineHeight: number
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

export type IFillKeys = AllKeys<IFill> | number

export type IStroke = {
  visible: boolean
  width: number
  fill: IFill
  align: 'inner' | 'center' | 'outer'
  cap: LINE_CAP
  join: LINE_JOIN
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
  | keyof ISchema
  | (string & {})
  | number

export type ISchemaOperation = {
  id: ID
  timestamp: number
  patches: ImmuiPatch[]
  description?: string
  noHistory?: boolean
}

export type ISchemaHistory = {
  operations: ISchemaOperation[]
  description: string
}
