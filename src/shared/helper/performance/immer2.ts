import { SP } from '~/editor/schema/mutate'

function createObj(k1: number, k2: number, k3: number, text: string): Record<string, any> {
  const s = new Date().getTime()

  const obj: Record<string, any> = {}

  for (let i = 0; i < k1 / 2; i++) {
    const o2: Record<string, any> = {}
    for (let i = 0; i < k2; i++) {
      o2['a' + i] = 'b' + i
    }
    for (let i = 0; i < k2; i++) {
      const o3: Record<string, any> = {}

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
  return obj
}

const obj = createObj(20000, 20, 5, '')

const startTime = new Date().getTime()

const ps = []
for (let i = 0; i < 100; i++) {
  ps.push(SP.add(obj, `${'a' + i}${'a' + i}`, 'b' + i))
}

const endTime = new Date().getTime()
const elapsedTime = endTime - startTime
console.log(`Elapsed time: ${elapsedTime} milliseconds`)
console.log(ps)

export const ABC = () => {}
