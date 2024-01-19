import autoBindMethods from 'class-autobind-decorator'
import { INoopFunc } from './utils/normal'

type IHook<T> = (value: T, oldValue: T) => void

type IHookOption = {
  id?: string
  immediately?: boolean
  before?: string
  after?: string
}

type IHookDescription = `id:${string}` | 'immediately' | `before:${string}` | `after:${string}`

export const signalMap = new Map<Signal<any>, IHook<any>[]>()

const hookOptionMap = new Map<Signal<any>, Map<IHook<any>, IHookOption>>()

@autoBindMethods
export class Signal<T extends any> {
  private newValue!: T
  private oldValue!: T
  private _intercept?: (value: T) => T | void
  constructor(value?: T) {
    this.newValue = value ?? this.newValue
    this.oldValue = value ?? this.oldValue
    signalMap.set(this, [])
    hookOptionMap.set(this, new Map())
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
  private get optionMap() {
    return hookOptionMap.get(this)!
  }
  hook(hook: IHook<T>, descriptions?: IHookDescription[]) {
    const { immediately } = this.processDescription(hook, descriptions || [])
    if (immediately) hook(this.newValue, this.oldValue)
    this.hooks.push(hook)
    return () => this.unHook(hook)
  }
  private unHook(hook: IHook<T>) {
    const index = this.hooks.findIndex((i) => i === hook)
    index !== -1 && this.hooks.splice(index, 1)
  }
  hookOnce(hook: IHook<T>, descriptions?: IHookDescription[]) {
    const once = (value: T, oldValue: T) => {
      hook(value, oldValue)
      this.unHook(once)
    }
    this.hook(once, descriptions)
  }
  dispatch(value?: T | ((value: T) => any)) {
    if (value === undefined) {
      this.value = this.newValue
    } else if (typeof value === 'function') {
      ;(value as Function)(this.newValue)
      this.value = this.newValue
    } else {
      this.value = value
    }
    if (isBatching) return
    this.hooks.forEach(this.runHook)
  }
  intercept(handle: (value: T) => T | void) {
    this._intercept = handle
  }
  private processDescription(hook: IHook<T>, descriptions: IHookDescription[]) {
    const option = <IHookOption>{}
    this.optionMap.set(hook, option)
    descriptions.map((desc) => {
      if (desc.includes(':')) {
        const [key, val] = desc.split(':')
        option[key as keyof IHookOption] = val as any
      }
      if (desc === 'immediately') option['immediately'] = true
    })
    return option
  }
  private runHook(hook: IHook<T>) {
    const { before, after } = this.optionMap.get(hook)!
    if (!before && !after) {
      return hook(this.newValue, this.oldValue)
    }
    const selfIndex = this.hooks.findIndex((i) => i === hook)
    if (before) {
      const anotherIndex = this.hooks.findIndex((i) => {
        return this.optionMap.get(i)?.id === before
      })
      if (selfIndex < anotherIndex) {
        hook(this.newValue, this.oldValue)
      } else {
        this.hooks.splice(selfIndex, 1)
        this.hooks.splice(anotherIndex, 0, hook)
      }
    }
    if (after) {
      const anotherIndex = this.hooks.findIndex((i) => {
        return this.optionMap.get(i)?.id === after
      })
      if (selfIndex > anotherIndex) {
        hook(this.newValue, this.oldValue)
      } else {
        this.hooks.splice(selfIndex, 1)
        this.hooks.splice(anotherIndex + 1, 0, hook)
      }
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
