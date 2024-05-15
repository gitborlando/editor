import { cloneDeep } from 'lodash-es'
import { clone, timeFor } from '~/shared/utils/normal'

const obj = { a: 123, b: { b: 456 } }

timeFor(10000, () => {
  JSON.parse(JSON.stringify(obj))
})
//10ms

timeFor(10000, () => {
  clone(obj)
})
//2ms

timeFor(10000, () => {
  cloneDeep(obj)
})
// 24ms
