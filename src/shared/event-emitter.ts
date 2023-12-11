type IEventType = 'stage-interact-type-changed'

class EventEmitter {
  private events = new Map<IEventType, ((...args: any[]) => void)[]>()
  on(eventType: IEventType, callback: (...args: any[]) => void): void {
    this.events.set(eventType, [...(this.events.get(eventType) || []), callback])
  }
  emit(eventType: IEventType, ...args: any[]): void {
    this.events.get(eventType)?.forEach((callback) => callback(...args))
  }
  off(eventType: IEventType, callback: (...args: any[]) => void): void {
    const callbacks = this.events.get(eventType)
    if (!callbacks) return
    this.events.set(
      eventType,
      callbacks.filter((i) => i !== callback)
    )
  }
}

export const eventEmitter = new EventEmitter()
export const EE = eventEmitter
