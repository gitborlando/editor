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
