import { nanoid } from 'nanoid'
import { ID } from 'src/editor/schema/type'
import { createCache } from '../utils/cache'
import { INoopFunc, iife } from '../utils/normal'

type IHook<T> = (value: T, oldValue: T, args?: any) => void

export type IHookOption = {
  id?: string
  immediately?: boolean
  once?: boolean
  before?: string
  after?: string
  beforeAll?: boolean
  afterAll?: boolean
}

export class Signal<T extends any> {
  newValue!: T
  oldValue!: T

  private _intercept?: (value: T) => T | void
  private hooks = <IHook<T>[]>[]
  private optionCache = createCache<IHook<T>, IHookOption>()

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
    this.optionCache.set(hook, option)
    if (option.immediately && option.once) {
      hook(this.value, this.oldValue)
    } else if (option.immediately) {
      hook(this.value, this.oldValue)
      this.hooks.push(hook)
    } else if (option.once) {
      const onceFunc = () => void hook(this.value, this.oldValue) || this.unHook(onceFunc)
      this.optionCache.set(onceFunc, option)
      this.hooks.push(onceFunc)
    } else {
      this.hooks.push(hook)
    }
    this.reHierarchy()
    return () => this.unHook(hook)
  }

  dispatch = (value?: T | ((value: T) => void), args?: any) => {
    if (typeof value === 'function') {
      ;(value as Function)(this.value)
    } else if (value !== undefined) {
      this.value = value
    }
    if (signalBatchMap.get(this)) return
    this.hooks.forEach((hook) => hook(this.value, this.oldValue, args))
  }

  intercept(handle: (value: T) => T | void) {
    this._intercept = handle
  }

  removeAll() {
    this.hooks = []
    this.optionCache.clear()
  }

  private unHook(hook: IHook<T>) {
    const index = this.hooks.findIndex((i) => i === hook)
    index !== -1 && this.hooks.splice(index, 1)
  }

  private reHierarchy() {
    this.hooks.forEach((hook) => {
      const option = this.optionCache.get(hook)
      const selfIndex = this.hooks.findIndex((i) => i === hook)
      if (option.beforeAll) {
        this.hooks.splice(selfIndex, 1)
        this.hooks.unshift(hook)
        return
      }
      if (option.afterAll) {
        this.hooks.splice(selfIndex, 1)
        this.hooks.push(hook)
        return
      }
      if (option.before) {
        const anotherIndex = this.hooks.findIndex((i) => {
          return this.optionCache.get(i).id === option.before
        })
        if (selfIndex > anotherIndex) {
          this.hooks.splice(selfIndex, 1)
          this.hooks.splice(anotherIndex, 0, hook)
        }
      }
      if (option.after) {
        const anotherIndex = this.hooks.findIndex((i) => {
          return this.optionCache.get(i).id === option.after
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

const mergeSignalCache = createCache<string, Signal<any>>()
const mergeSignalIdCache = createCache<Signal<any>, ID>()

export function mergeSignal(...signals: Signal<any>[]) {
  const id = signals.reduce((allId, signal) => {
    return allId + '-' + mergeSignalIdCache.getSet(signal, () => nanoid())
  }, '')
  return mergeSignalCache.getSet(id, () => {
    const mergedSignal = createSignal<void>()
    let fullFill = new Array(signals.length).fill(false)
    signals.forEach((signal, index) => {
      signal.hook(() => {
        fullFill[index] = true
        if (fullFill.every((i) => i === true)) {
          mergedSignal.dispatch()
          fullFill = new Array(signals.length).fill(false)
        }
      })
    })
    return mergedSignal
  })
}

const signalBatchMap = createCache<Signal<any>, boolean>()

export function batchSignal(...args: Signal<any>[]): INoopFunc
export function batchSignal(...args: [...Signal<any>[], INoopFunc]): void
export function batchSignal(...args: Signal<any>[] | [...Signal<any>[], INoopFunc]) {
  const [signals, callback] = iife(() => {
    if (args[args.length - 1] instanceof Function) {
      return [args.slice(0, -1), args[args.length - 1]] as [Signal<any>[], INoopFunc]
    } else {
      return [args as Signal<any>[]] as [Signal<any>[]]
    }
  })
  const delayDispatch = () => {
    signals.forEach((signal) => signalBatchMap.set(signal, false))
    signals.forEach((signal) => signal.dispatch())
  }
  signals.forEach((signal) => signalBatchMap.set(signal, true))

  if (!callback) return delayDispatch

  callback()
  delayDispatch()
}

export function multiSignal(...signals: Signal<any>[]) {
  const newSignal = createSignal<void>()
  signals.forEach((signal) => {
    signal.hook(() => newSignal.dispatch())
  })
  return newSignal
}
