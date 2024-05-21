import { forEach } from 'lodash-es'
import { timeFor } from '~/shared/utils/normal'

const arr = new Array(10000).fill(0)
const count = 10

timeFor(() => {
  for (let i = 0; i < arr.length; i++) arr[i]
}, count) //0.966ms

timeFor(() => {
  arr.forEach((item) => item)
}, count) //1.136ms

timeFor(() => {
  forEach(arr, (item) => item)
}, count) //2.044ms

timeFor(() => {
  for (const a of arr) a
}, count) //1.326ms
