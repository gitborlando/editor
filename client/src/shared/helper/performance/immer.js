import { createDraft } from 'immer'
import { Record } from 'immutable'
import { observable } from 'mobx'

let api = null

const Api = [observable, createDraft, Record, (a) => a]

function test(k1, k2, k3, text) {
  const s = new Date().getTime()

  const obj = api({})

  for (let i = 0; i < k1 / 2; i++) {
    const o2 = {}
    for (let i = 0; i < k2; i++) {
      o2['a' + i] = 'b' + i
    }
    for (let i = 0; i < k2; i++) {
      const o3 = {}

      for (let i = 0; i < k3; i++) {
        o3['a' + i] = 'b' + i
      }
      o2['a' + i] = o3
    }
    obj['a' + i] = o2
  }
  for (let i = 0; i < k1 / 2; i++) {
    obj['a' + i] = { x: 0, y: 0, id: 'abc', type: 'normal' }
  }

  console.log(`${k1} ${k2} ${k3}` + ' -> ', new Date().getTime() - s + ' ms')
}

for (let i = 0; i < Api.length - 1; i++) {
  api = Api[i]

  console.log(`\n=========${['mobx', 'immer', 'immutable', 'raw'][i]}==========`)

  test(1000, 10, 5, '')

  test(2000, 10, 5, '')

  test(1000, 20, 5, '')

  test(1000, 10, 10, '')

  test(3000, 10, 5, '')

  test(1000, 30, 5, '')

  test(10000, 10, 5, '')

  test(10000, 20, 5, '')

  test(20000, 20, 5, '')
}

/**
 * 
=========mobx==========
1000 10 5 ->  79 ms
2000 10 5 ->  115 ms
1000 20 5 ->  98 ms
1000 10 10 ->  88 ms
3000 10 5 ->  158 ms
1000 30 5 ->  146 ms
10000 10 5 ->  566 ms
10000 20 5 ->  1201 ms
20000 20 5 ->  2129 ms

=========immer==========
1000 10 5 ->  7 ms
2000 10 5 ->  12 ms
1000 20 5 ->  8 ms
1000 10 10 ->  7 ms
3000 10 5 ->  12 ms
1000 30 5 ->  14 ms
10000 10 5 ->  56 ms
10000 20 5 ->  123 ms
20000 20 5 ->  381 ms

=========immutable==========
1000 10 5 ->  8 ms
2000 10 5 ->  15 ms
1000 20 5 ->  13 ms
1000 10 10 ->  6 ms
3000 10 5 ->  17 ms
1000 30 5 ->  18 ms
10000 10 5 ->  94 ms
10000 20 5 ->  147 ms
20000 20 5 ->  293 ms

=========raw==========
1000 10 5 ->  5 ms
2000 10 5 ->  4 ms
1000 20 5 ->  4 ms
1000 10 10 ->  5 ms
3000 10 5 ->  6 ms
1000 30 5 ->  8 ms
10000 10 5 ->  28 ms
10000 20 5 ->  53 ms
20000 20 5 ->  105 ms
 */
