import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { IXY } from '~/shared/utils'
import { IStageElement } from '../../element'

type ICustomCTX = Omit<StageCTXService, 'ctx' | 'customCTX'>

type IStrokeOption = {
  width: number
  color?: string
}

@autobind
@injectable()
export class StageCTXService {
  ctx = <ICustomCTX>{}
  customCTX(custom: (ctx: typeof this.ctx) => void) {
    custom(this.ctx)
  }
  beginPath() {
    this.ctx.beginPath()
  }
  closePath() {
    this.ctx.closePath()
  }
  moveTo(to: IXY) {
    this.ctx.moveTo(to)
  }
  lineTo(to: IXY) {
    this.ctx.lineTo(to)
  }
  arcTo(handle: IXY, to: IXY, radius: number) {
    this.ctx.arcTo(handle, to, radius)
  }
  bezierTo(handle1: IXY, handle2: IXY, to: IXY) {
    this.ctx.bezierTo(handle1, handle2, to)
  }
  drawRect(x: number, y: number, width: number, height: number) {
    this.ctx.drawRect(x, y, width, height)
  }
  drawStroke(element: IStageElement, option: IStrokeOption) {
    this.ctx.drawStroke(element, option)
  }
}

export const injectStageCTX = inject(StageCTXService)
