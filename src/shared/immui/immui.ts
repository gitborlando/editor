type IKey = string | number
export type ImmuiPatch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  value: any
  oldValue?: any
}
export type ImmuiApplyPatchOption = {
  reverse?: boolean
  prefix?: string
}

export default class Immui {
  private keyPathDiffMap = <any>{}
  private noCommitPatch = false
  private typePathPatchMap = new Map<string, ImmuiPatch[]>()

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

    return this.getPatch('add', keys, value)
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

    return this.getPatch('replace', keys, value, oldValue)
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

    return this.getPatch('remove', keys, undefined, oldValue)
  }

  next = <T>(object: T): T => {
    const traverse = (oldObj: any, newObj: any, keyPathMap: any) => {
      for (const key in oldObj) {
        if (!keyPathMap[key]) {
          newObj[key] = oldObj[key]
          continue
        }
        if (typeof oldObj[key] !== 'object') {
          newObj[key] = oldObj[key]
        } else {
          newObj[key] = Array.isArray(oldObj[key]) ? [] : {}
          traverse(oldObj[key], newObj[key], keyPathMap[key])
        }
      }
      return newObj
    }
    const newObject = traverse(object, {}, this.keyPathDiffMap)
    this.keyPathDiffMap = {}
    return newObject
  }

  commitPatches = () => {
    const patches = []
    for (const item of this.typePathPatchMap.values()) {
      const [first, last] = [item[0], item[item.length - 1]]
      first.value = last.value
      patches.push(first)
    }
    this.typePathPatchMap.clear()
    return patches
  }

  applyPatches = <T extends object>(
    object: T,
    patches: ImmuiPatch[],
    option: ImmuiApplyPatchOption = {}
  ) => {
    const { reverse, prefix = '' } = option

    if (reverse) {
      patches = patches.slice().reverse()
      // this.noCommitPatch = true
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

    this.noCommitPatch = false
  }

  private getPatch = (
    type: 'add' | 'replace' | 'remove',
    keys: IKey[],
    value: any,
    oldValue?: any
  ) => {
    let curKeyPathDiffMap = this.keyPathDiffMap
    keys.forEach((key, i) => {
      if (!curKeyPathDiffMap[key]) {
        if (i != keys.length - 1) {
          curKeyPathDiffMap = curKeyPathDiffMap[key] = {}
        } else {
          curKeyPathDiffMap[key] = undefined
        }
      } else {
        curKeyPathDiffMap = curKeyPathDiffMap[key]!
      }
    })

    const path = '/' + keys.join('/')
    const patch = { type, path, value: clone(value), oldValue: clone(oldValue) }

    if (this.noCommitPatch) return patch

    const patches = this.typePathPatchMap.get(type + path)
    if (!patches) this.typePathPatchMap.set(type + path, [patch])
    else patches.push(patch)

    return patch
  }

  static matchPath = (path: string, pattern: string) => {
    const pathArr = path.split('/')
    const patternArr = pattern.split('/')
    if (pattern.endsWith('$')) {
      if (pathArr.length !== patternArr.length - 1) return false
      patternArr.splice(-1, 1)
    }
    for (let i = 0; i < patternArr.length; i++) {
      const curPattern = patternArr[i]
      if (curPattern === pathArr[i]) continue
      if (curPattern === '*' || curPattern === '?' || curPattern === '') continue
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
