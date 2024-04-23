import autoBindMethods from 'class-autobind-decorator'
import { createCache } from './cache'
import { INoopFunc, iife } from './utils/normal'

type IHook<T> = (value: T, oldValue: T) => void

export type IHookOption = {
  id?: string
  immediately?: boolean
  once?: boolean
  before?: string
  after?: string
  afterAll?: boolean
}

@autoBindMethods
export class Signal<T extends any> {
  newValue!: T
  oldValue!: T
  arguments = <any>{}
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
  hook(hook: IHook<T>): () => void
  hook(option: IHookOption, hook: IHook<T>): () => void
  hook(hookOrOption: IHook<T> | IHookOption, hookCallback?: IHook<T>) {
    const [hook, option] = iife<[IHook<T>, IHookOption]>(() => {
      if (hookCallback) return [hookCallback, hookOrOption as IHookOption]
      return [hookOrOption as IHook<T>, {} as IHookOption]
    })
    const { immediately, once } = this.optionCache.set(hook, option)
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
    this.arguments = {}
  }
  private reArrangeHook() {
    this.hooks.forEach((hook) => {
      const { before, after, afterAll } = this.optionCache.get(hook)
      const selfIndex = this.hooks.findIndex((i) => i === hook)
      if (afterAll) {
        this.hooks.splice(selfIndex, 1)
        this.hooks.push(hook)
        return
      }
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

const argsCache = createCache<any, symbol>()
export function createSignalArgs<T extends any>() {
  const key = Symbol()
  return (args?: T): T | undefined => {
    if (args !== undefined) return argsCache.set(key, args)
    return argsCache.get(key)
  }
}

export function multiSignal(signals: Signal<any>[], callback: INoopFunc) {
  let signalsFullFillArray = new Array(signals.length).fill(false)
  signals.forEach((signal, index) => {
    signal.hook(() => {
      if (signalsFullFillArray.every((i) => i === true)) {
        callback()
        signalsFullFillArray = new Array(signals.length).fill(false)
      } else signalsFullFillArray[index] = true
    })
  })
}

let isBatching = false
export function batchSignal<T extends any[]>(
  signals: Signal<any>[],
  callback: (...args: T) => any
) {
  return (...args: T) => {
    isBatching = true
    callback(...args)
    isBatching = false
    signals.forEach((signal) => signal.dispatch())
  }
}
