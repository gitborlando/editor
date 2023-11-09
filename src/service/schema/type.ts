export type ISchemaMeta = {
  id: string
  name: string
  lock: boolean
  visible: boolean
  select: boolean
  hover: boolean
  // parent: ISchema
}

export type ISchemaBase = ISchemaMeta & {
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

export type ISchema = IFrame | IGroup | IRect | IEllipse | IText | ILine | IPolygon

export type IFrame = ISchemaBase & {
  type: 'frame'
  childIds: string[]
}

export type IGroup = ISchemaBase & {
  type: 'group'
  childIds: string[]
}

export type IRect = ISchemaBase & {
  type: 'rect'
}

export type IEllipse = ISchemaBase & {
  type: 'ellipse'
  radius: number
  angle: number
}

export type IPolygon = ISchemaBase & {
  type: 'polygon'
  sides: number
}

export type ILine = ISchemaBase & {
  type: 'line'
}

export type IText = ISchemaBase & {
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
