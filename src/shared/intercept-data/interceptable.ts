import { IValueWillChange, intercept, observable } from 'mobx'
import { autobind } from '../decorator'
import { createHooker } from '../hooker'

@autobind
class Interceptable<T extends Record<string, any>, K extends keyof T = keyof T> {
  _noIntercept = false
  _observedData: T
  _whenDataWillChange = createHooker<[{ key: K; ctx: IValueWillChange<T[K]> }]>()
  _whenDataDidChange = createHooker<[{ key: K; val: T[K] }]>()
  constructor(sourceData: T) {
    this._observedData = observable(sourceData)
    this.intercept()
  }
  private intercept() {
    const sourceKeys = <K[]>Object.keys(this._observedData)
    sourceKeys.forEach((key) => {
      intercept(this._observedData, key, (ctx) => {
        if (this._noIntercept) return ctx
        this._whenDataWillChange.dispatch({ key, ctx })
        this._whenDataDidChange.dispatch({ key, val: ctx.newValue })
        return ctx
      })
    })
  }
}

export function createInterceptData<T extends Record<string, any>, K extends keyof T>(
  sourceData: T
) {
  const data = new Interceptable<T, K>(sourceData)
  return new Proxy(data, {
    get(_, key: string) {
      if (key === '_noIntercept') return data._noIntercept
      if (key === '_whenDataWillChange') return data._whenDataWillChange
      if (key === '_whenDataDidChange') return data._whenDataDidChange
      return data._observedData[key]
    },
    set(_, key: string, value: any) {
      if (key === '_noIntercept') data._noIntercept = value
      if (key === '_whenDataWillChange') data._whenDataWillChange = value
      if (key === '_whenDataDidChange') data._whenDataDidChange = value
      data._observedData[key as K] = value
      return true
    },
  }) as unknown as Omit<Interceptable<T, K>, '_observedData'> & typeof sourceData
}
