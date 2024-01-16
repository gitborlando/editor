import autoBindMethods from 'class-autobind-decorator'
import { IAnyFunc, INoopFunc } from './utils/normal'

type IHook = {
  (value: any, oldValue: any): void
  option?: {
    id?: string
    immediately?: boolean
    priority?: `after:${string}`
  }
}

export const signalMap = new Map<Signal<any>, IHook[]>()

@autoBindMethods
export class Signal<T extends any> {
  private newValue!: T
  private oldValue!: T
  private _intercept?: (value: T) => T | void
  constructor(value?: T) {
    this.newValue = value ?? this.newValue
    this.oldValue = value ?? this.oldValue
    signalMap.set(this, [])
  }
  get value(): T {
    return this.newValue
  }
  set value(value: T) {
    this.oldValue = this.newValue
    const interceptRes = this._intercept?.(value)
    this.newValue = interceptRes ?? value
  }
  private get hooks() {
    return signalMap.get(this)!
  }
  hook(hook: IHook, option?: IHook['option']) {
    hook.option = option
    this.hooks.push(hook)
    if (option?.immediately) hook(this.newValue, this.oldValue)
    return () => this.unHook(hook)
  }
  unHook(hook: IHook) {
    const index = this.hooks.findIndex((i) => i === hook)
    index !== -1 && this.hooks.splice(index, 1)
  }
  hookOnce(hook: IHook) {
    const once = (value: T, oldValue: T) => {
      hook(value, oldValue)
      this.unHook(once)
    }
    this.hook(once)
  }
  immediateHook(hook: IHook, option?: IHook['option']) {
    return this.hook(hook, { ...option, immediately: true })
  }
  priorityHook(priority: `after:${string}`, hook: IHook, option?: IHook['option']) {
    return this.hook(hook, { ...option, priority })
  }
  dispatch(value?: T) {
    this.value = value === undefined ? this.newValue : value
    if (isBatching) return batchSignals.add(this)
    this.hooks.forEach(this.runHook)
  }
  intercept(handle: (value: T) => T | void) {
    this._intercept = handle
  }
  private runHook(hook: IHook) {
    const priority = hook.option?.priority
    if (priority) {
      const selfIndex = this.hooks.findIndex((i) => i === hook)
      const anotherIndex = this.hooks.findIndex((i) => i.option?.id === priority.split(':')[1])
      if (selfIndex > anotherIndex) hook(this.newValue, this.oldValue)
      else {
        this.hooks.splice(selfIndex, 1)
        this.hooks.splice(anotherIndex + 1, 0, hook)
      }
    } else {
      hook(this.newValue, this.oldValue)
    }
  }
}

export function createSignal<T extends any>(value?: T) {
  return new Signal<T>(value)
}

export function multiSignal(signals: Signal<any>[], callback: INoopFunc) {
  signals.forEach((signal) => signal.hook(callback))
}

let isBatching = false
const batchSignals = new Set<Signal<any>>()

export function batchSignal(callback: IAnyFunc) {
  isBatching = true
  callback()
  isBatching = false
  batchSignals.forEach((signal) => signal.dispatch())
  batchSignals.clear()
}
