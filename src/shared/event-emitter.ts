class EventEmitter {
  'node-change-x' = this.createHandler<number[]>()

  private events = new Map<any, ((...args: any) => void)[]>()
  private createHandler<T extends any[]>() {
    const handler = {
      on: (callback: (...args: T) => void) => {
        this.events.set(handler, [...(this.events.get(handler) || []), callback])
      },
      emit: (...args: T) => {
        this.events.get(handler)?.forEach((callback) => callback(...args))
      },
    }
    return handler
  }
}

export const eventEmitter = new EventEmitter()
export const EE = eventEmitter
