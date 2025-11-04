import { Is } from '@gitborlando/utils'

type IKey = string | number

type AnyObject = Record<string, any>

export type ImmutPatch = {
  type: 'add' | 'remove' | 'replace'
  keys: IKey[]
  value?: any
  oldValue?: any
}

export default class Immut<T extends AnyObject = AnyObject> {
  constructor(public state: T) {}

  get = <T>(keyPath: string, isParent = false) => {
    const keys = keyPath.split(/\.|\//) as IKey[]
    let current: any = this.state
    let len = isParent ? keys.length - 1 : keys.length
    for (let i = 0; i < len; i++) {
      current = current[keys[i]]
      if (Is.falsy(current)) console.log('Immut error at get function')
    }
    return current as T
  }

  push = <T>(keyPath: string, value: T) => {
    const keys = keyPath.split(/\.|\//) as IKey[]
    const parent = this.get<any[]>(keyPath)

    parent.push(value)
    keys.push(parent.length - 1)

    this.track({ type: 'add', keys, value, oldValue: undefined })
  }

  set = <T>(keyPath: string, value: T) => {
    const keys = keyPath.split(/\.|\//) as IKey[]
    const parent = this.get<any>(keyPath, true)
    const lastKey = keys[keys.length - 1]
    const oldValue = parent[lastKey]

    parent[lastKey] = value

    if (oldValue === undefined) {
      this.track({ type: 'add', keys, value, oldValue: undefined })
    } else if (oldValue !== value) {
      this.track({ type: 'replace', keys, value, oldValue })
    }
  }

  delete = (keyPath: string) => {
    const keys = keyPath.split(/\.|\//) as IKey[]
    const parent = this.get<any>(keyPath, true)
    const lastKey = keys[keys.length - 1]
    const oldValue = parent[lastKey]

    if (Array.isArray(parent)) {
      parent.splice(<any>lastKey, 1)
    } else {
      delete parent[lastKey]
    }

    this.track({ type: 'remove', keys, value: undefined, oldValue })
  }

  next = () => {
    if (!this.patches.length) return

    this.traverse(this.state, this.changeMap)
    this.listeners.forEach((callback) => callback(this.patches))

    this.patches = []
    this.changeMap = {}
  }

  subscribe = (callback: (patches: ImmutPatch[]) => void) => {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private patches = <ImmutPatch[]>[]
  private changeMap = <any>{}
  private listeners = new Set<(...args: any) => any>()

  private track = (patch: ImmutPatch) => {
    patch.value = this.deepClone(patch.value)
    patch.oldValue = this.deepClone(patch.oldValue)
    this.patches.push(patch)

    let curMap = this.changeMap
    patch.keys.forEach((key, i) => {
      if (i !== patch.keys.length - 1) {
        if (!curMap[key]) curMap = curMap[key] = {}
      } else {
        curMap[key] = undefined
      }
    })
  }

  private traverse = (object: any, changeMap: any) => {
    if (typeof changeMap !== 'object') return

    for (const key in changeMap) {
      if (!object[key]) continue

      object[key] = this.shallowClone(object[key])
      this.traverse(object[key], changeMap[key])
    }
  }

  private shallowClone = (object: any) => {
    if (typeof object !== 'object' || object === null) return object
    return Array.isArray(object) ? [...object] : { ...object }
  }

  private deepClone = (object: any) => {
    if (typeof object !== 'object' || object === null) return object
    const newObj: any = Array.isArray(object) ? [] : {}
    for (const key in object) newObj[key] = this.deepClone(object[key])
    return newObj
  }
}
