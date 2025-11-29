export interface IXY {
  x: number
  y: number
}

export interface IRect {
  x: number
  y: number
  width: number
  height: number
}

export interface IRectWithCenter extends IRect {
  centerX: number
  centerY: number
}
