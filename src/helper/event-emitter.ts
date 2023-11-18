type IEventType = ['mask-div-exist', 'stage-instance-exist'][number]

type ICallback = (...args: any[]) => void

class EventEmitter {
  private events = new Map<IEventType, ICallback[]>()
  on(eventType: IEventType, callback: ICallback): void {
    this.events.set(eventType, [...(this.events.get(eventType) || []), callback])
  }
  once(eventType: IEventType, callback: ICallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args)
      this.off(eventType, onceCallback)
    }
    this.events.set(eventType, [...(this.events.get(eventType) || []), onceCallback])
  }
  off(eventType: IEventType, callback: ICallback): void {
    const callbacks = this.events.get(eventType)
    if (!callbacks) return
    this.events.set(
      eventType,
      callbacks.filter((i) => i !== callback)
    )
  }
  emit(eventType: IEventType, ...args: any[]): void {
    this.events.get(eventType)?.forEach((callback) => callback(...args))
  }
}

export const eventEmitter = new EventEmitter()
export const EE = eventEmitter
