import autoBindMethods from 'class-autobind-decorator'
import { IAnyFunc } from './utils/normal'

type IHookOption = {
  immediately?: boolean
}

export const signalMap = new Map<any, (((value: any, oldValue: any) => void) | undefined)[]>()

@autoBindMethods
export class Signal<T extends any> {
  private newValue!: T
  private oldValue!: T
  private _intercept?: (value: T) => T | void
  constructor(value?: T) {
    this.newValue = value ?? this.newValue
    this.oldValue = value ?? this.oldValue
  }
  get value(): T {
    return this.newValue
  }
  set value(value: T) {
    this.oldValue = this.newValue
    const interceptRes = this._intercept?.(value)
    this.newValue = interceptRes ?? value
  }
  hook(hook: (value: T, oldValue: T) => void, option?: IHookOption) {
    let hooks = signalMap.get(this)
    if (!hooks) signalMap.set(this, (hooks = []))
    hooks.push(hook)
    if (option?.immediately) hook(this.newValue, this.oldValue)
    return () => this.unHook(hook)
  }
  unHook(hook: (value: T, oldValue: T) => void) {
    let hooks = signalMap.get(this) || []
    hooks = hooks.filter((i) => i !== hook)
    signalMap.set(this, hooks)
  }
  hookOnce(hook: (value: T, oldValue: T) => void) {
    const once = (value: T, oldValue: T) => {
      hook(value, oldValue)
      this.unHook(once)
    }
    this.hook(once)
  }
  immediateHook(hook: (value: T, oldValue: T) => void, option?: IHookOption) {
    return this.hook(hook, { ...option, immediately: true })
  }
  dispatch(value?: T) {
    this.value = value ?? this.newValue
    if (isBatching) return batchSignals.add(this)
    signalMap.get(this)?.forEach((hook) => hook?.(this.newValue, this.oldValue))
  }
  intercept(handle: (value: T) => T | void) {
    this._intercept = handle
  }
}

export function createSignal<T extends any>(value?: T) {
  return new Signal<T>(value)
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
