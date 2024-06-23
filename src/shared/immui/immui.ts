type IKey = string | number
export type ImmuiPatch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  value: any
  oldValue?: any
  keys: IKey[]
}
export type ImmuiApplyPatchOption = {
  reverse?: boolean
  prefix?: string
}

export default class Immui {
  private keyPathDiffMap = <any>{}
  private order = 0
  private mutates: { keys: IKey[]; value: any; oldValue: any }[] = []

  add = <T>(object: object, keyPath: string | IKey[], value: T) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      current = current[key]
      if (!current) console.log('Error at add function')
    }

    const lastKey = keys[keys.length - 1]
    if (Array.isArray(current)) {
      current.splice(<any>lastKey, 0, value)
    } else {
      current[lastKey] = value
    }

    this.recordChange(keys, value)
  }

  reset = <T>(object: object, keyPath: string | IKey[], value: T) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      current = current[key]
      if (!current) console.log('Error at reset function')
    }

    const lastKey = keys[keys.length - 1]
    let oldValue = current[lastKey]
    current[lastKey] = value

    this.recordChange(keys, value, oldValue)
  }

  delete = (object: object, keyPath: string | IKey[]) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      current = current[key]
      if (!current) console.log('Error at delete function')
    }

    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]

    if (Array.isArray(current)) {
      current.splice(<any>lastKey, 1)
    } else {
      delete current[lastKey]
    }

    this.recordChange(keys, undefined, oldValue)
  }

  next = <T>(object: T): [T, ImmuiPatch[]] => {
    const patches = <ImmuiPatch[]>[]

    const traverse = (object: any, keyPathMap: any, keys: string[]) => {
      for (const key in keyPathMap) {
        const _keys = [...keys, key]

        if (keyPathMap[key][this.symbolValue]) {
          const [value, oldValue] = keyPathMap[key][this.symbolValue]
          if (value === oldValue) continue

          const path = '/' + _keys.join('/')
          const patch = <any>{ keys: _keys, path, value: clone(value), oldValue: clone(oldValue) }

          if (value === undefined) patch.type = 'remove'
          else if (oldValue === undefined) patch.type = 'add'
          else patch.type = 'replace'

          patches[keyPathMap[key][this.symbolOrder]] = patch
        } else {
          if (!object[key]) continue

          const content = object[key]
          object[key] = Array.isArray(content) ? [...content] : { ...content }
          traverse(object[key], keyPathMap[key], _keys)
        }
      }
    }

    traverse(object, this.keyPathDiffMap, [])

    this.keyPathDiffMap = {}
    this.order = 0

    return [object, patches.filter(Boolean)]
  }

  applyPatches = <T extends object>(
    object: T,
    patches: ImmuiPatch[],
    option: ImmuiApplyPatchOption = {}
  ) => {
    const { reverse, prefix = '' } = option

    if (reverse) {
      patches = patches.slice().reverse()
    }

    patches.forEach((patch) => {
      const path = prefix + patch.path
      const keys = path.split('/').filter(Boolean)
      switch (patch.type) {
        case 'add':
          if (reverse) this.delete(object, keys)
          else this.add(object, keys, clone(patch.value))
          return
        case 'replace':
          if (reverse) this.reset(object, keys, clone(patch.oldValue))
          else this.reset(object, keys, clone(patch.value))
          return
        case 'remove':
          if (reverse) this.add(object, keys, clone(patch.oldValue))
          else this.delete(object, keys)
          return
      }
    })
  }

  private symbolValue = Symbol('value')
  private symbolOrder = Symbol('order')

  private recordChange = (keys: IKey[], value?: any, oldValue?: any) => {
    let curKeyPathDiffMap = this.keyPathDiffMap

    keys.forEach((key, i) => {
      if (!curKeyPathDiffMap[key]) {
        if (i !== keys.length - 1) {
          curKeyPathDiffMap = curKeyPathDiffMap[key] = {}
        } else {
          curKeyPathDiffMap[key] = {
            [this.symbolValue]: [value, oldValue],
            [this.symbolOrder]: this.order++,
          }
        }
      } else {
        if (i !== keys.length - 1) {
          curKeyPathDiffMap = curKeyPathDiffMap[key]!
        } else {
          if (!curKeyPathDiffMap[key][this.symbolValue]) {
            curKeyPathDiffMap[key][this.symbolValue] = []
          }
          if (value) {
            curKeyPathDiffMap[key][this.symbolValue][0] = value
          } else {
            curKeyPathDiffMap[key][this.symbolValue] = [value, oldValue]
          }
          curKeyPathDiffMap[key][this.symbolOrder] = this.order++
        }
      }
    })
  }

  static matchPath = (path: IKey[], pattern: string[]) => {
    if (pattern[pattern.length - 1] !== '...') {
      if (path[path.length - 1] !== pattern[pattern.length - 1]) return false
      if (path.length !== pattern.length) return false
    }
    for (let i = 0; i < pattern.length - 1; i++) {
      if (pattern[i] === '?' || pattern[i] === '' || pattern[i] === '...') continue
      if (pattern[i] == path[i]) continue
      return false
    }
    return true
  }
}

function clone(object: any) {
  if (typeof object !== 'object') return object
  const newObj: any = Array.isArray(object) ? [] : {}
  for (const key in object) newObj[key] = clone(object[key])
  return newObj
}
