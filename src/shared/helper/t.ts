// import { rotatePoint } from '~/editor/math/base'
import { XY } from '../structure/xy'

const s = performance.now()
for (let i = 0; i < 50000 * 4; i++) {
  XY.Of(0, 0)
}
console.log('t ', performance.now() - s)
