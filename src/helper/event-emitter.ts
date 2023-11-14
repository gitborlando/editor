type IEventType = ['mask-div-exist', 'stage-instance-exist'][number]

type ICallback = (...args: any[]) => void

class EventEmitter {
  private events = new Map<IEventType, ICallback[]>()
  on(eventName: IEventType, callback: ICallback): void {
    this.events.set(eventName, [...(this.events.get(eventName) || []), callback])
  }
  off(eventName: IEventType, callback: ICallback): void {
    const callbacks = this.events.get(eventName)
    if (!callbacks) return
    this.events.set(
      eventName,
      callbacks.filter((i) => i !== callback)
    )
  }
  emit(eventName: IEventType, ...args: any[]): void {
    this.events.get(eventName)?.forEach((callback) => callback(...args))
  }
}

export const eventEmitter = new EventEmitter()
export const EE = eventEmitter
