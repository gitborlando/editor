import { timeOf } from 'src/shared/utils/normal'

const obj: any = {}
timeOf(
  5000,
  (i) => {
    obj[i] = i
  },
  100,
  10
)

const map: any = new Map()
timeOf(
  5000,
  (i) => {
    map.set(i, i)
  },
  100,
  10
)
