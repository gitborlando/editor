import { IXY } from '../utils'

export type ISchema = {
  meta: IMeta
  pages: IPage[]
  nodes: Record<string, INode>
}

export type IMeta = {
  id: string
  name: string
  user: string
}

export type IPage = {
  id: string
  name: string
  zoom: number
  offset: IXY
  childIds: string[]
}

export type INode =
  | IFrame
  | IGroup
  | IRect
  | IEllipse
  | IText
  | ILine
  | ITriangle
  | IStar
  | IIrregular
export type INodeParent = IFrame | IGroup | IPage

export type INodeMeta = {
  id: string
  name: string
  lock: boolean
  visible: boolean
  select: boolean
  hover: boolean
  parentId: string
  _needRender: boolean
}

export type INodeBase = INodeMeta & {
  x: number
  y: number
  width: number
  height: number
  opacity: number
  rotation: number
  hFlip: boolean
  vFlip: boolean
  fills: IFill[]
  strokes: any[]
  blurs: any[]
  shadows: any[]
  fill: string
}

export type IFrame = INodeBase & {
  type: 'frame'
  childIds: string[]
}

export type IGroup = INodeBase & {
  type: 'group'
  childIds: string[]
}

export type IPoint = {
  type: 'point'
  mode: 'no-bezier' | 'symmetric' | 'angle-symmetric' | 'no-symmetric'
  x: number
  y: number
  handleIn: IXY
  handleOut: IXY
  radius: number
}

export type IVector = INodeBase & {
  type: 'vector'
  closed: boolean
  points: IPoint[]
}

export type IIrregular = IVector & {
  vectorType: 'irregular'
}

export type IRect = IVector & {
  vectorType: 'rect'
  radius: number
}

export type IEllipse = IVector & {
  vectorType: 'ellipse'
  innerRate: number
  startAngle: number
  endAngle: number
}

export type ITriangle = IVector & {
  vectorType: 'triangle'
  sides: number
  radius: number
}

export type IStar = IVector & {
  vectorType: 'star'
  sides: number
  innerRate: number
}

export type ILine = IVector & {
  vectorType: 'line'
  start: IXY
  end: IXY
  length: number
}

export type IText = INodeBase & {
  type: 'text'
  font: {}
}

export type IFill = IFillColor | IFillLinearGradient | IFillRadialGradient | IFillImage

export type IFillColor = {
  type: 'color'
  color: string
}

export type IFillLinearGradient = {
  type: 'linearGradient'
  start: IXY
  end: IXY
  stops: { xy: IXY; color: string }[]
}

export type IFillRadialGradient = {
  type: 'radialGradient'
  center: IXY
  radiusA: IXY
  radiusB: IXY
  stops: { xy: IXY; color: string }[]
}

export type IFillGonicGradient = {
  type: 'gonicGradient'
  startAngle: number
  center: IXY
  stops: { xy: IXY; color: string }[]
}

export type IFillImage = {
  type: 'image'
  url: string
  matrix: number[]
}
