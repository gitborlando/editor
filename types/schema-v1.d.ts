namespace V1 {
  type Schema = {
    meta: Meta
    [id: string & {}]: SchemaItem
  }

  type SchemaItem = Node | Page | Meta

  type NodeOrPage = Node | Page

  type Meta = {
    type: 'meta'
    id: 'meta'
    fileId: string
    name: string
    version: `v${number}`
    pageIds: string[]
    userId: string
  }

  type Client = {
    selectIds: Record<string, boolean>
    selectPageId: string
    cursor: import('@gitborlando/geo').IXY
  }

  type Clients = {
    [clientId: number]: Client
  }

  type NodeParentBase = {
    childIds: string[]
  }

  type Page = NodeParentBase & {
    type: 'page'
    id: `page_${string}`
    name: string
  }

  type NodeParent = Frame | Group | Page

  type Node = Frame | Group | Rectangle | Ellipse | Text | Line | Polygon | Star | Irregular

  type NodeMeta = {
    id: string
    name: string
    lock: boolean
    visible: boolean
    parentId: string
  }

  type Transform = {
    x: number
    y: number
    width: number
    height: number
    rotation: number
  }

  type NodeBase = NodeMeta &
    Transform & {
      opacity: number
      hFlip: boolean
      vFlip: boolean
      fills: Fill[]
      strokes: Stroke[]
      blurs: any[]
      shadows: Shadow[]
    }

  type Frame = NodeBase &
    NodeParentBase & {
      type: 'frame'
      radius: number
    }

  type Group = NodeBase &
    NodeParentBase & {
      type: 'group'
    }

  type Point = {
    type: 'point'
    symmetric: 'angle' | 'complete' | 'none'
    x: number
    y: number
    radius: number
    handleL?: XY
    handleR?: XY
    endPath?: boolean
    startPath?: boolean
  }

  type Vector = Rectangle | Ellipse | Polygon | Star | Line | Irregular

  type VectorBase = {
    points: Point[]
  }

  type Irregular = NodeBase &
    VectorBase & {
      type: 'irregular'
    }

  type Rectangle = NodeBase &
    VectorBase & {
      type: 'rect'
      radius: number
    }

  type Ellipse = NodeBase &
    VectorBase & {
      type: 'ellipse'
      innerRate: number
      startAngle: number
      endAngle: number
    }

  type Polygon = NodeBase &
    VectorBase & {
      type: 'polygon'
      sides: number
      radius: number
    }

  type Star = NodeBase &
    VectorBase & {
      type: 'star'
      pointCount: number
      radius: number
      innerRate: number
    }

  type Line = NodeBase &
    VectorBase & {
      type: 'line'
    }

  type Text = NodeBase & {
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

  type Fill = FillColor | FillLinearGradient | FillImage

  type FillMeta = {
    visible: boolean
    alpha: number
  }

  type FillColor = FillMeta & {
    type: 'color'
    color: string
  }

  type FillLinearGradient = FillMeta & {
    type: 'linearGradient'
    start: XY
    end: XY
    stops: { offset: number; color: string }[]
  }

  type FillImage = FillMeta & {
    type: 'image'
    url: string
    matrix: number[]
  }

  type FillKeys = AllKeys<IFill> | number

  type Stroke = {
    visible: boolean
    width: number
    fill: Fill
    align: 'inner' | 'center' | 'outer'
    cap: CanvasRenderingContext2D['lineCap']
    join: CanvasRenderingContext2D['lineJoin']
  }

  type Shadow = {
    visible: boolean
    offsetX: number
    offsetY: number
    blur: number
    spread: number
    fill: Fill
  }

  type SchemaPropKey =
    | keyof Meta
    | keyof Client
    | keyof Page
    | keyof NodeMeta
    | keyof Frame
    | keyof Group
    | keyof Rectangle
    | keyof Polygon
    | keyof Star
    | keyof Irregular
    | keyof Ellipse
    | keyof Line
    | keyof FillColor
    | keyof FillLinearGradient
    | keyof FillImage
    | keyof Shadow
    | keyof Stroke
    | keyof Text
    | keyof Text['style']
    | keyof Point
    | keyof NodeBase
    | keyof Schema
    | (string & {})
    | number
}
