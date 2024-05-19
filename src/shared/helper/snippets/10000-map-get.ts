import { timeFor } from '~/shared/utils/normal'

const map = {}
let count = 10000

timeFor(count, (i) => {
  // map.set(i, { a: true })
  map[i] = { a: true }
})

timeFor(count, (i) => {
  // map.get(i)
  map[i]
})
