export type ISchema = {
  id: string
  nodes: Record<string, INode>
  pages: IPage[]
}

export type IPage = {
  id: string
  name: string
  childIds: string[]
}

export type INodeMeta = {
  id: string
  name: string
  lock: boolean
  visible: boolean
  select: boolean
  hover: boolean
  // parent: ISchema
}

export type INodeBase = INodeMeta & {
  x: number
  y: number
  width: number
  height: number
  opacity: number
  rotation: number
  points: IPoint[]
  fills: IFill[]
  strokes: any[]
  blurs: any[]
  shadows: any[]
  stroke: string
  strokeWidth: number
}

export type INode = IFrame | IGroup | IRect | IEllipse | IText | ILine | IPolygon

export type IFrame = INodeBase & {
  type: 'frame'
  childIds: string[]
}

export type IGroup = INodeBase & {
  type: 'group'
  childIds: string[]
}

export type IRect = INodeBase & {
  type: 'rect'
}

export type IEllipse = INodeBase & {
  type: 'ellipse'
  radius: number
  angle: number
}

export type IPolygon = INodeBase & {
  type: 'polygon'
  sides: number
}

export type ILine = INodeBase & {
  type: 'line'
}

export type IText = INodeBase & {
  type: 'text'
  font: {}
}

export type IPoint = {
  x: number
  y: number
  type: 1 | 2 | 3 | 4
  radius: number
}

export type IFillColor = {
  type: 'color'
  color: string
}

export type IFillLinearGradient = {
  type: 'linearGradient'
  startPoint: IPoint
  endPoint: IPoint
  stops: Record<string, string>
}

export type IFillImg = {
  type: 'img'
  url: string
}

export type IFill = IFillColor | IFillLinearGradient | IFillImg

// export type IStroke = {
//   strokeWith
// }
