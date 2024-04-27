import { produce, produceWithPatches } from 'immer'
import { Map } from 'immutable'
import set from 'immutable-set'
import { Immui } from './immui'

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
  for (let i = 0; i < 1000000; i++) {
    Immui.get(object, ['foo', 'bar', 'baz', 'value'])
  }
  console.timeEnd('Immui get')

  console.time('Immui add')
  for (let i = 0; i < 1000000; i++) {
    Immui.add(object, ['foo', 'bar', 'baz', 'newValue'], i)
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui add')

  console.time('Immui reset')
  for (let i = 0; i < 1000000; i++) {
    Immui.reset(object, ['foo', 'bar', 'baz', 'value'], i)
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui reset')

  console.time('Immui delete')
  for (let i = 0; i < 1000000; i++) {
    Immui.delete(object, ['foo', 'bar', 'baz', 'value'])
    !isGeek && Immui.commit(object)
  }
  console.timeEnd('Immui delete')

  if (isGeek) {
    console.time('Immui commit')
    for (let i = 0; i < 1000000; i++) {
      Immui.commit(object)
    }
    console.timeEnd('Immui commit')
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
  console.log('immui-performance-vs')

  testImmerPerformance()
  console.log('------------------------------------------------------------')

  testImmutablePerformance()
  console.log('------------------------------------------------------------')

  testNativePerformance()
  console.log('------------------------------------------------------------')

  testImmuiPerformance(true)
  console.log('------------------------------------------------------------')

  testImmuiPerformance()
  console.log('------------------------------------------------------------')

  testImmutableSetPerformance()
  console.log('immui-performance-vs')
}
