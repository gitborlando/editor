import { inject, injectable } from 'tsyringe'
import { autobind } from '~/editor/utility/decorator'
import { IXY } from '~/editor/utility/utils'

type IACustomCTXShouldBe = {
  beginPath(): void
  closePath(): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  arcTo(x: number, y: number): void
}

@autobind
@injectable()
export class StageCTXService {
  initialized = false
  ctx: any
  customCTX(custom: (ctx: typeof this.ctx) => void) {
    if (this.initialized) return
    custom(this.ctx)
    this.initialized = true
  }
  moveTo({ x, y }: IXY) {
    this.ctx.moveTo(x, y)
  }
  lineTo({ x, y }: IXY) {
    this.ctx.lineTo(x, y)
  }
  arcTo(p1: IXY, p2: IXY, radius: number) {
    this.ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius)
  }
  bezierTo() {}
}

export const injectStageCTX = inject(StageCTXService)
