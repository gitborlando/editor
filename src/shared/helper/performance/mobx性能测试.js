import { Record } from 'immutable'
import { observable } from 'mobx'

let mobx = false

function test(k1, k2, k3, text) {
  const s = new Date().getTime()

  const o1 = {}
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
      o2['a' + i] = (mobx ? observable : Record)(o3)
    }
    o1['a' + i] = (mobx ? observable : Record)(o2)
  }
  for (let i = 0; i < k1 / 2; i++) {
    o1['a' + i] = (mobx ? observable : Record)({ x: 0, y: 0, id: 'abc', type: 'normal' })
  }

  console.log(`${k1} ${k2} ${k3}` + ' -> ', new Date().getTime() - s)
}

mobx = true

test(1000, 10, 5, '')

test(2000, 10, 5, '')

test(1000, 20, 5, '')

test(1000, 10, 10, '')

test(3000, 10, 5, '')

test(1000, 30, 5, '')

test(10000, 10, 5, '')

// makeAutoObservable({
//   type: 'rect',
//   version: '3.6.4',
//   originX: 'left',
//   originY: 'top',
//   left: 50,
//   top: 50,
//   width: 100,
//   height: 100,
//   fill: 'blue',
//   stroke: null,
//   strokeWidth: 1,
//   strokeDashArray: null,
//   strokeLineCap: 'butt',
//   strokeDashOffset: 0,
//   strokeLineJoin: 'miter',
//   strokeMiterLimit: 4,
//   scaleX: 1.19,
//   scaleY: 1,
//   angle: 0,
//   flipX: false,
//   flipY: false,
//   opacity: 1,
//   shadow: null,
//   visible: true,
//   clipTo: null,
//   backgroundColor: '',
//   fillRule: 'nonzero',
//   paintFirst: 'fill',
//   globalCompositeOperation: 'source-over',
//   transformMatrix: null,
//   skewX: 0,
//   skewY: 0,
//   rx: 0,
//   ry: 0,
// })
