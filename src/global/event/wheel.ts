import { WheelEvent as ReactWheelEvent } from 'react'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'

@autobind
@injectable()
export class EventWheelService {
  direction = <1 | -1>1
  beforeWheel = createHooker()
  duringWheel = createHooker<[WheelEvent | ReactWheelEvent, typeof this.direction]>()
  afterWheel = createHooker()
  private wheelTimeOut?: NodeJS.Timeout
  onWheel(e: WheelEvent | ReactWheelEvent) {
    if (this.wheelTimeOut) {
      clearTimeout(this.wheelTimeOut)
    } else {
      this.beforeWheel.dispatch()
    }

    this.direction = e.deltaY > 0 ? 1 : -1
    this.duringWheel.dispatch(e, this.direction)

    this.wheelTimeOut = setTimeout(() => {
      this.wheelTimeOut = undefined
      this.afterWheel.dispatch()
    }, 250)
  }
}

export const injectEventWheel = inject(EventWheelService)
