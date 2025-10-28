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
  add = <T>(object: object, keyPath: string | IKey[], value: T) => {
    const keys = Array.isArray(keyPath)
      ? keyPath
      : (keyPath.split(/\.|\//) as IKey[])

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
    const keys = Array.isArray(keyPath)
      ? keyPath
      : (keyPath.split(/\.|\//) as IKey[])

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
    const keys = Array.isArray(keyPath)
      ? keyPath
      : (keyPath.split(/\.|\//) as IKey[])

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

    this.changes.forEach((change) => {
      const { keys, value, oldValue } = change
      if (value === oldValue) return

      const patch = <any>{
        keys: keys,
        path: '/' + keys.join('/'),
        value: this.deepClone(value),
        oldValue: this.deepClone(oldValue),
      }

      if (value === undefined) patch.type = 'remove'
      else if (oldValue === undefined) patch.type = 'add'
      else patch.type = 'replace'

      patches.push(patch)
    })

    const traverse = (object: any, changeChainMap: any) => {
      if (typeof changeChainMap !== 'object') return

      for (const key in changeChainMap) {
        if (!object[key]) return

        object[key] = this.shallowClone(object[key])
        traverse(object[key], changeChainMap[key])
      }
    }

    traverse(object, this.changeChainMap)
    this.changeChainMap = {}
    this.changes = []

    return [object, patches.filter(Boolean)]
  }

  private changes = <{ keys: IKey[]; value?: any; oldValue?: any }[]>[]
  private changeChainMap = <any>{}

  private recordChange = (keys: IKey[], value?: any, oldValue?: any) => {
    this.changes.push({ keys, value, oldValue })

    let curMap = this.changeChainMap
    keys.forEach((key, i) => {
      if (i !== keys.length - 1) {
        if (!curMap[key]) {
          curMap[key] = {}
        }
        curMap = curMap[key]
      } else {
        curMap[key] = undefined
      }
    })
  }

  applyPatches = <T extends object>(
    object: T,
    patches: ImmuiPatch[],
    option: ImmuiApplyPatchOption = {},
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
          else this.add(object, keys, this.deepClone(patch.value))
          return
        case 'replace':
          if (reverse) this.reset(object, keys, this.deepClone(patch.oldValue))
          else this.reset(object, keys, this.deepClone(patch.value))
          return
        case 'remove':
          if (reverse) this.add(object, keys, this.deepClone(patch.oldValue))
          else this.delete(object, keys)
          return
      }
    })
  }

  private shallowClone(object: any) {
    if (typeof object !== 'object') return object
    return Array.isArray(object) ? [...object] : { ...object }
  }

  private deepClone(object: any) {
    if (typeof object !== 'object') return object
    const newObj: any = Array.isArray(object) ? [] : {}
    for (const key in object) newObj[key] = this.deepClone(object[key])
    return newObj
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
