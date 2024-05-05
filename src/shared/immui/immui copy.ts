type IKey = string | number

export type IImmuiPatch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  value: any
  oldValue?: any
}

const IMMUI_DIRTY = '__immui_dirty'

export default class ImmuiCopy {
  private static needDiff = true
  private static typePathPatchMap = <Record<string, IImmuiPatch[]>>{}
  static get<T>(object: object, keyPath: string | IKey[]): T {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (const key of keys) {
      if (!current) console.log('Error at get function')
      current = current[key]
    }

    return current as T
  }
  static add<T>(object: object, keyPath: string | IKey[], value: T) {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    current[IMMUI_DIRTY] = true
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at add function')
      current = current[key]
      current[IMMUI_DIRTY] = true
    }

    if (!current) console.log('Error at add function')
    const lastKey = keys[keys.length - 1]
    current[lastKey] = value

    return this.getPatch('add', keys, value)
  }
  static reset<T>(object: object, keyPath: string | IKey[], value: T) {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    current[IMMUI_DIRTY] = true
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at reset function')
      current = current[key]
      current[IMMUI_DIRTY] = true
    }

    if (!current) console.log('Error at reset function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    current[lastKey] = value

    return this.getPatch('replace', keys, value, oldValue)
  }
  static delete(object: object, keyPath: string | IKey[]) {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    current[IMMUI_DIRTY] = true
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at delete function')
      current = current[key]
      current[IMMUI_DIRTY] = true
    }

    if (!current) console.log('Error at delete function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    if (Array.isArray(current)) current.splice(<any>lastKey, 1)
    else delete current[lastKey]

    return this.getPatch('remove', keys, undefined, oldValue)
  }
  static next<T>(object: T): T {
    const traverse = (oldObj: any) => {
      if (!oldObj[IMMUI_DIRTY]) return oldObj
      const newObj: any = Array.isArray(oldObj) ? [] : {}
      for (const key in oldObj) {
        if (!Object.hasOwn(oldObj, key)) continue
        if (key === IMMUI_DIRTY) continue
        const value = oldObj[key]
        newObj[key] = typeof value !== 'object' ? value : traverse(value)
      }
      return newObj
    }
    return traverse(object)
  }
  static applyPatches<T extends object>(object: T, patches: IImmuiPatch[], inverse?: boolean) {
    this.needDiff = false
    patches.forEach((patch) => {
      const keys = patch.path.split('/').filter(Boolean)
      switch (patch.type) {
        case 'add':
          if (inverse) return ImmuiCopy.delete(object, keys)
          return ImmuiCopy.add(object, keys, patch.value)
        case 'replace':
          if (inverse) return ImmuiCopy.reset(object, keys, patch.oldValue)
          return ImmuiCopy.reset(object, keys, patch.value)
        case 'remove':
          if (inverse) return ImmuiCopy.add(object, keys, patch.oldValue)
          return ImmuiCopy.delete(object, keys)
      }
    })
    this.needDiff = true
    // return Immui.next(object)
  }
  static commitPatches() {
    const patches = []
    for (const item of Object.values(this.typePathPatchMap)) {
      const [first, last] = [item[0], item[item.length - 1]]
      first.value = last.value
      patches.push(first)
    }
    this.typePathPatchMap = {}
    return patches
  }
  private static getPatch(
    type: 'add' | 'replace' | 'remove',
    keys: IKey[],
    value: any,
    oldValue?: any
  ) {
    const path = '/' + keys.join('/')
    const patch = { type, path, value, oldValue }
    if (!this.needDiff) return
    const patches = this.typePathPatchMap[type + path]
    if (!patches) this.typePathPatchMap[type + path] = [patch]
    else patches.push(patch)
    return patch
  }
}
