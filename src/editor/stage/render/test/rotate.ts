import { rotatePoint } from 'src/editor/math/base'
import { xy_ } from 'src/editor/math/xy'
import { timeOf } from 'src/shared/utils/normal'

const a = xy_(0, 100)
const o = xy_(200, 200)

timeOf(
  10000 * 4,
  (i) => {
    rotatePoint(a.x, a.y, o.x, o.y, 30)
  },
  10,
  4
)

const ctx = document.createElement('canvas').getContext('2d')!

timeOf(
  10000,
  () => {
    ctx.rotate(30)
  },
  10,
  4
)

export function test() {}
