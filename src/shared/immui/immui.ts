type IKey = string | number
export type IImmuiPatch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  value: any
  oldValue?: any
}
export type IApplyPatchOption = {
  reverse?: boolean
  prefix?: string
}

export default class Immui {
  private keyPathDiffMap = <any>{}
  private noCommitPatch = false
  private typePathPatchMap = new Map<string, IImmuiPatch[]>()

  add = <T>(object: object, keyPath: string | IKey[], value: T) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at add function')
      current = current[key]
    }

    if (!current) console.log('Error at add function')
    const lastKey = keys[keys.length - 1]
    current[lastKey] = value

    return this.getPatch('add', keys, value)
  }

  reset = <T>(object: object, keyPath: string | IKey[], value: T) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) {
        console.log('Error at reset function')
        console.log(object, keys, i)
      }
      current = current[key]
    }

    if (!current) console.log('Error at reset function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    current[lastKey] = value

    return this.getPatch('replace', keys, value, oldValue)
  }

  delete = (object: object, keyPath: string | IKey[]) => {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])
    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at delete function')
      current = current[key]
    }

    if (!current) console.log('Error at delete function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    if (Array.isArray(current)) current.splice(<any>lastKey, 1)
    else delete current[lastKey]

    return this.getPatch('remove', keys, undefined, oldValue)
  }

  next = <T>(object: T): T => {
    const traverse = (oldObj: any, newObj: any = {}) => {
      for (const key in oldObj) {
        if (!this.keyPathDiffMap[key]) {
          newObj[key] = oldObj[key]
          continue
        }
        if (typeof oldObj[key] !== 'object') {
          newObj[key] = oldObj[key]
        } else {
          newObj[key] = Array.isArray(oldObj[key]) ? [] : {}
          traverse(oldObj[key], newObj[key])
        }
      }
      return newObj
    }
    const newObject = traverse(object)
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
    patches: IImmuiPatch[],
    option: IApplyPatchOption = {}
  ) => {
    const { reverse, prefix = '' } = option
    if (reverse) patches = patches.reverse()

    patches.forEach((patch) => {
      const path = prefix + patch.path
      const keys = path.split('/').filter(Boolean)
      switch (patch.type) {
        case 'add':
          if (reverse) this.delete(object, keys)
          else this.add(object, keys, patch.value)
          return
        case 'replace':
          if (reverse) this.reset(object, keys, patch.oldValue)
          else this.reset(object, keys, patch.value)
          return
        case 'remove':
          if (reverse) this.add(object, keys, patch.oldValue)
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
          curKeyPathDiffMap[key] = {}
        } else {
          curKeyPathDiffMap[key] = undefined
        }
      } else {
        curKeyPathDiffMap = curKeyPathDiffMap[key]!
      }
    })

    const path = '/' + keys.join('/')
    const patch = { type, path, value, oldValue }

    if (this.noCommitPatch) return patch

    const patches = this.typePathPatchMap.get(type + path)
    if (!patches) this.typePathPatchMap.set(type + path, [patch])
    else patches.push(patch)

    return patch
  }
}
