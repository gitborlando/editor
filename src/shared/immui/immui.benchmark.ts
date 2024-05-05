import { produce, produceWithPatches } from 'immer'
import { Map } from 'immutable'
import Immui from './immui'

const testImmuiPerformance = (isGeek: boolean = false) => {
  const immui = new Immui()

  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  isGeek && console.log('immui Geek')
  console.time('immui get')
  for (let i = 0; i < 1000000; i++) {
    object.foo.bar.baz.value
  }
  console.timeEnd('immui get')

  console.time('immui add')
  for (let i = 0; i < 1000000; i++) {
    immui.add(object, ['foo', 'bar', 'baz', 'newValue'], i)
    !isGeek && immui.next(object)
  }
  console.timeEnd('immui add')

  console.time('immui reset')
  for (let i = 0; i < 1000000; i++) {
    immui.reset(object, ['foo', 'bar', 'baz', 'value'], i)
    !isGeek && immui.next(object)
  }
  console.timeEnd('immui reset')

  console.time('immui delete')
  for (let i = 0; i < 1000000; i++) {
    immui.delete(object, ['foo', 'bar', 'baz', 'value'])
    !isGeek && immui.next(object)
  }
  console.timeEnd('immui delete')

  if (isGeek) {
    console.time('immui commit')
    for (let i = 0; i < 1000000; i++) {
      immui.next(object)
    }
    console.timeEnd('immui commit')
  }
}

const testImmerPerformance = () => {
  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  console.time('immer get')
  produce(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.value
    }
  })
  console.timeEnd('immer get')

  console.time('immer add')
  produce(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.newValue = i
    }
  })
  console.timeEnd('immer add')

  console.time('immer reset')
  produce(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.value = i
    }
  })
  console.timeEnd('immer reset')

  console.time('immer delete')
  produce(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      delete draft.foo.bar.baz
    }
  })
  console.timeEnd('immer delete')
}

const testImmerWithPatchesPerformance = () => {
  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  console.time('immer get')
  produceWithPatches(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.value
    }
  })
  console.timeEnd('immer get')

  console.time('immer add')
  produceWithPatches(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.newValue = i
    }
  })
  console.timeEnd('immer add')

  console.time('immer reset')
  produceWithPatches(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      draft.foo.bar.baz.value = i
    }
  })
  console.timeEnd('immer reset')

  console.time('immer delete')
  produceWithPatches(object, (draft) => {
    for (let i = 0; i < 1000000; i++) {
      delete draft.foo.bar.baz
    }
  })
  console.timeEnd('immer delete')
}

const testImmutablePerformance = () => {
  const object = Map({
    foo: Map({
      bar: Map({
        baz: Map({
          value: 0,
        }),
      }),
    }),
  })

  console.time('immutable get')
  for (let i = 0; i < 1000000; i++) {
    object.getIn(['foo', 'bar', 'baz', 'value'])
  }
  console.timeEnd('immutable get')

  console.time('immutable add')
  for (let i = 0; i < 1000000; i++) {
    object.setIn(['foo', 'bar', 'baz', 'newValue'], i)
  }
  console.timeEnd('immutable add')

  console.time('immutable reset')
  for (let i = 0; i < 1000000; i++) {
    object.setIn(['foo', 'bar', 'baz', 'value'], i)
  }
  console.timeEnd('immutable reset')

  console.time('immutable delete')
  for (let i = 0; i < 1000000; i++) {
    object.deleteIn(['foo', 'bar', 'baz', 'value'])
  }
  console.timeEnd('immutable delete')
}

const testNativePerformance = () => {
  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  console.time('native get')
  for (let i = 0; i < 1000000; i++) {
    object.foo.bar.baz.value
  }
  console.timeEnd('native get')

  console.time('native add')
  for (let i = 0; i < 1000000; i++) {
    object.foo.bar.baz.newValue = i
  }
  console.timeEnd('native add')

  console.time('native reset')
  for (let i = 0; i < 1000000; i++) {
    object.foo.bar.baz.value = i
  }
  console.timeEnd('native reset')

  console.time('native delete')
  for (let i = 0; i < 1000000; i++) {
    delete object.foo.bar.baz
  }
  console.timeEnd('native delete')
}

const testImmutableSetPerformance = () => {
  const object = {
    foo: {
      bar: {
        baz: {
          value: 0,
        },
      },
    },
  }

  console.time('immutable-set add')
  for (let i = 0; i < 1000000; i++) {
    set(object, ['foo', 'bar', 'baz', 'newValue'], i)
  }
  console.timeEnd('immutable-set add')

  console.time('immutable-set reset')
  for (let i = 0; i < 1000000; i++) {
    set(object, ['foo', 'bar', 'baz', 'value'], i)
  }
  console.timeEnd('immutable-set reset')
}

export function immuiPerformanceVs() {
  console.log('immui-performance-vs\n')

  testImmerPerformance()
  console.log('-----------------------------------')

  testImmutablePerformance()
  console.log('-----------------------------------')

  testNativePerformance()
  console.log('-----------------------------------')

  testimmuiPerformance(true)
  console.log('-----------------------------------')

  testimmuiPerformance()
  console.log('-----------------------------------')

  console.log('immui-performance-vs')
}
