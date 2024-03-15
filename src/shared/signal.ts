import autoBindMethods from 'class-autobind-decorator'
import { createCache } from './cache'
import { INoopFunc } from './utils/normal'

type IHook<T> = (value: T, oldValue: T) => void

type IHookOption = {
  id?: string
  immediately?: boolean
  once?: boolean
  before?: string
  after?: string
}

export type IHookDescription =
  | `id:${string}`
  | 'immediately'
  | 'once'
  | `before:${string}`
  | `after:${string}`

@autoBindMethods
export class Signal<T extends any> {
  newValue!: T
  oldValue!: T
  private _intercept?: (value: T) => T | void
  private hooks = <IHook<T>[]>[]
  private optionCache = createCache<IHookOption, IHook<T>>()
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
  hook(hook: IHook<T>, descriptions?: IHookDescription[]) {
    const option = this.processDescription(hook, descriptions || [])
    const { immediately, once } = option
    if (immediately && once) {
      hook(this.value, this.oldValue)
    } else if (immediately) {
      hook(this.value, this.oldValue)
      this.hooks.push(hook)
    } else if (once) {
      const onceFunc = () => void hook(this.value, this.oldValue) || this.unHook(onceFunc)
      this.optionCache.set(onceFunc, option)
      this.hooks.push(onceFunc)
    } else {
      this.hooks.push(hook)
    }
    return () => this.unHook(hook)
  }
  dispatch(value?: T | ((value: T) => void)) {
    if (typeof value === 'function') {
      ;(value as Function)(this.value)
    } else if (value !== undefined) {
      this.value = value
    }
    this.runHooks()
  }
  intercept(handle: (value: T) => T | void) {
    this._intercept = handle
  }
  private unHook(hook: IHook<T>) {
    const index = this.hooks.findIndex((i) => i === hook)
    index !== -1 && this.hooks.splice(index, 1)
  }
  private runHooks() {
    if (isBatching) return
    this.reArrangeHook()
    this.hooks.forEach((hook) => hook(this.value, this.oldValue))
    argsCache.forEach((key) => argsCache.set(key, undefined))
  }
  private processDescription(hook: IHook<T>, descriptions: IHookDescription[]) {
    const option = this.optionCache.getSet(hook, () => ({}))
    descriptions.forEach((desc) => {
      if (desc.includes(':')) {
        const [key, val] = desc.split(':')
        option[key as keyof IHookOption] = val as any
      }
      if (desc === 'immediately') option.immediately = true
      if (desc === 'once') option.once = true
    })
    return option
  }
  private reArrangeHook() {
    this.hooks.forEach((hook) => {
      const { before, after } = this.optionCache.get(hook)
      const selfIndex = this.hooks.findIndex((i) => i === hook)
      if (before) {
        const anotherIndex = this.hooks.findIndex((i) => {
          return this.optionCache.get(i).id === before
        })
        if (selfIndex > anotherIndex) {
          this.hooks.splice(selfIndex, 1)
          this.hooks.splice(anotherIndex, 0, hook)
        }
      }
      if (after) {
        const anotherIndex = this.hooks.findIndex((i) => {
          return this.optionCache.get(i).id === after
        })
        if (selfIndex < anotherIndex) {
          this.hooks.splice(selfIndex, 1)
          this.hooks.splice(anotherIndex + 1, 0, hook)
        }
      }
    })
  }
}

export function createSignal<T extends any>(value?: T) {
  return new Signal<T>(value)
}

const contextCache = createCache<any>()
export function createSignalContext<T extends any>(key: string) {
  return (context?: T): T => contextCache.getSet(key, () => context)
}

const argsCache = createCache<any, symbol>()
export function createSignalArgs<T extends any>() {
  const key = Symbol()
  return (args?: T): T | undefined => {
    if (args !== undefined) return argsCache.set(key, args)
    return argsCache.get(key)
  }
}

export function multiSignal(signals: Signal<any>[], callback: INoopFunc) {
  signals.forEach((signal) => signal.hook(callback))
}

let isBatching = false
export function batchSignal<T extends any[]>(
  toBatchSignals: Signal<any>[],
  callback: (...args: T) => any
) {
  return (...args: T) => {
    isBatching = true
    callback(...args)
    isBatching = false
    toBatchSignals.forEach((signal) => signal.dispatch())
  }
}
