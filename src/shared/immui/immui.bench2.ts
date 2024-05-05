import { enablePatches, produce, produceWithPatches } from 'immer'
import { Immui } from '~/shared/immui/immui'

// Native reducer
function nativeReducer(state: any, action: any) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    case 'DECREMENT':
      return { count: state.count - 1 }
    default:
      return state
  }
}

// Immer reducer
function immerReducer(state: any, action: any) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case 'INCREMENT':
        draftState.count += 1
        break
      case 'DECREMENT':
        draftState.count -= 1
        break
    }
  })
}

// Test performance
const iterations = 1000000
let state = { count: 0 }

console.time('Native reducer')
for (let i = 0; i < iterations; i++) {
  state = nativeReducer(state, { type: 'INCREMENT' })
}
console.timeEnd('Native reducer')

state = { count: 0 }

console.time('Immer reducer')
const action = { type: 'INCREMENT' }
enablePatches()
produceWithPatches(state, (draftState) => {
  for (let i = 0; i < iterations; i++) {
    switch (action.type) {
      case 'INCREMENT':
        draftState.count += 1
        break
      case 'DECREMENT':
        draftState.count -= 1
        break
    }
  }
})

console.timeEnd('Immer reducer')

console.time('Immui reducer')
state = { count: 0 }

for (let i = 0; i < iterations; i++) {
  switch (action.type) {
    case 'INCREMENT':
      Immui.reset(state, ['count'], state.count + 1)
      break
    case 'DECREMENT':
      Immui.reset(state, ['count'], state.count - 1)
      break
  }
  state = Immui.next(state)
}
console.timeEnd('Immui reducer')

export function abc() {}
