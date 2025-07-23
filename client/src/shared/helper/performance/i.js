const obj = {}
// const array = []

for (let i = 0; i < 1000000; i++) {
  obj['a' + i] = 'b' + i
  // array.push('a' + i)
}

const key = 'a123456'
let s = new Date().getTime()

for (let i = 0; i < 100000; i++) {
  obj[key]
}

console.log(new Date().getTime() - s + 'ms')

// // for (let i = 0; i < 100000; i++) {
// //   const a = obj['a' + i]
// // } 23 ms

// for (let i = 0; i < 100000; i++) {
//   'a' + i
// }

// console.log(new Date().getTime() - s + 'ms')

// s = new Date().getTime()

// for (let i = 0; i < 100000; i++) {
//   obj['a' + i]
// }

// console.log(new Date().getTime() - s + 'ms')

// s = new Date().getTime()

// for (let i = 0; i < 100000; i++) {
//   array[i]
// }

// console.log(new Date().getTime() - s + 'ms')

// -------------------------------------------------------------------------------------

// console.time('XY')
// for (let i = 0; i < 100000; i++) {
//   XY.From({ x: 1, y: 2 }).rotate(XY.From({ x: 0, y: 0 }), 90)
// }
// console.timeEnd('XY')

// console.time('xy')
// for (let i = 0; i < 100000; i++) {
//   xy_rotate({ x: 1, y: 2 }, { x: 0, y: 0 }, 90)
// }
// console.timeEnd('xy')
