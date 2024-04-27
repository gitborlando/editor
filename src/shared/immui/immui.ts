type IKey = string | number

let keyPathDiffMap = <any>{}

export const Immui = {
  get<T>(object: object, keyPath: string | IKey[]): T {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (const key of keys) {
      if (!current) console.log('Error at get function')
      current = current[key]
    }

    return current as T
  },
  add<T>(object: object, keyPath: string | IKey[], value: T) {
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

    return makeDiff('add', keys, value)
  },
  reset<T>(object: object, keyPath: string | IKey[], value: T) {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as IKey[])

    let current: any = object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('Error at reset function')
      current = current[key]
    }

    if (!current) console.log('Error at reset function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    current[lastKey] = value

    return makeDiff('replace', keys, value, oldValue)
  },
  delete(object: object, keyPath: string | IKey[]) {
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

    return makeDiff('remove', keys, undefined, oldValue)
  },
  commit<T>(object: T): T {
    const newObject = traverse(object)
    keyPathDiffMap = {}
    return newObject
  },
}

const makeDiff = (
  type: 'add' | 'replace' | 'remove',
  keys: IKey[],
  newValue: any,
  oldValue?: any
) => {
  let curKeyPathDiffMap = keyPathDiffMap
  let patch: any
  let inversePatch: any
  const path = '/' + keys.join('/')
  keys.forEach((key, i) => {
    if (!curKeyPathDiffMap[key]) {
      if (i != keys.length - 1) {
        curKeyPathDiffMap[key] = {}
      } else {
        curKeyPathDiffMap[key] = undefined
        if (type === 'add') {
          patch = { type, path, value: newValue }
          inversePatch = { type: 'remove', path }
        } else if (type === 'replace') {
          patch = { type, path, value: newValue }
          inversePatch = { type, path, value: oldValue }
        } else {
          patch = { type, path }
          inversePatch = { type: 'add', path, value: oldValue }
        }
      }
    }
    curKeyPathDiffMap = curKeyPathDiffMap[key]!
  })

  return { patch, inversePatch }
}

const traverse = (oldObj: any, newObj: any = {}) => {
  for (const key in oldObj) {
    if (!keyPathDiffMap[key]) {
      newObj[key] = oldObj[key]
      continue
    } else {
      if (typeof oldObj[key] !== 'object') {
        newObj[key] = oldObj[key]
      } else {
        newObj[key] = Array.isArray(oldObj[key]) ? [] : {}
        traverse(oldObj[key], newObj[key])
      }
    }
  }
  return newObj
}

const testImmuiPerformance = (isGeek: boolean = false) => {
  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  isGeek && console.log('Immui Geek')
  console.time('Immui get')
  for (let i = 0; i < 1; i++) {
    Immui.get(object, ['foo', 'bar', 'baz', 'value'])
  }
  console.timeEnd('Immui get')

  console.time('Immui add')
  for (let i = 0; i < 1; i++) {
    Immui.add(object, ['foo', 'bar', 'baz', 'newValue'], 'i')
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui add')

  console.time('Immui reset')
  for (let i = 0; i < 1; i++) {
    Immui.reset(object, ['foo', 'bar', 'baz', 'value'], 'i')
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui reset')

  console.time('Immui delete')
  for (let i = 0; i < 1; i++) {
    Immui.delete(object, ['foo', 'bar', 'baz', 'value'])
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui delete')

  if (isGeek) {
    console.time('Immui commit')
    for (let i = 0; i < 1; i++) {
      Immui.commit(object)
    }
    console.timeEnd('Immui commit')
  }
}

// testImmuiPerformance()
