import autobind from 'class-autobind-decorator'
import { WheelEvent as ReactWheelEvent } from 'react'
import { createSignal } from 'src/shared/signal/signal'

type IWheelData = { e: WheelEvent | ReactWheelEvent; direction: 1 | -1 }

@autobind
export class EventWheelService {
  beforeWheel = createSignal<IWheelData>()
  duringWheel = createSignal<IWheelData>()
  afterWheel = createSignal<IWheelData>()

  private wheelTimeOut?: NodeJS.Timeout

  onWheel(e: WheelEvent | ReactWheelEvent) {
    const direction = e.deltaY > 0 ? 1 : -1

    if (this.wheelTimeOut) {
      clearTimeout(this.wheelTimeOut)
    } else {
      this.beforeWheel.dispatch({ e, direction })
    }

    this.duringWheel.dispatch({ e, direction })

    this.wheelTimeOut = setTimeout(() => {
      this.wheelTimeOut = undefined
      this.afterWheel.dispatch({ e, direction })
    }, 250)
  }
}

export const EventWheel = new EventWheelService()
