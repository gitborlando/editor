import { cloneDeep } from 'lodash-es'
import { clone, timeFor } from 'src/shared/utils/normal'

const obj = { a: 123, b: { b: 456 } }
const count = 10000

timeFor(() => {
  JSON.parse(JSON.stringify(obj))
}, count)
//10ms

timeFor(() => {
  clone(obj)
}, count)
//2ms

timeFor(() => {
  cloneDeep(obj)
}, count)
// 24ms
