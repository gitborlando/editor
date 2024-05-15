import { forEach } from 'lodash-es'
import { timeFor } from '~/shared/utils/normal'

const arr = new Array(10).fill(0)

timeFor(10000, () => {
  for (let i = 0; i < arr.length; i++) arr[i]
}) //0.966ms

timeFor(10000, () => {
  arr.forEach((item) => item)
}) //1.136ms

timeFor(10000, () => {
  forEach(arr, (item) => item)
}) //2.044ms

timeFor(10000, () => {
  for (const a of arr) a
}) //1.326ms
